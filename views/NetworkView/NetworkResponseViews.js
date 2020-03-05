/* globals d3 */
import VisView from '../VisView/VisView.js';
import SingletonFilter from '../../filters/SingletonFilter.js';

class NetworkResponseDasView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/NetworkView/style.less' },
      { type: 'text', url: 'views/NetworkView/template.html' }
    ]);
    this.humanLabel = 'Initial Network / Hierarchy Data Details';
    this.responseType = 'dasResponse';

    this.svgSize = 200;

    this.simulations = {};
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();

    // Empty out the input stuff
    this.d3el.select('.networkBuilder').html('');
  }
  draw () {
    super.draw();
    const filteredList = window.controller.getFilteredTransitionList()
      .filter(transition => {
        return transition[this.responseType] !== null &&
          transition[this.responseType].exampleNetwork;
      });

    for (const transition of filteredList) {
      if (!this.simulations[transition.transitionId]) {
        this.simulations[transition.transitionId] = d3.forceSimulation();
      }
    }

    const container = this.d3el.select('.networkBuilder');
    let svgs = container.selectAll('svg')
      .data(filteredList, d => d.transitionId);
    svgs.exit().remove();
    const svgsEnter = svgs.enter().append('svg')
      .classed('exampleData', true)
      .attr('width', this.svgSize)
      .attr('height', this.svgSize);
    svgs = svgs.merge(svgsEnter);

    svgsEnter.append('g').classed('edgeLayer', true);
    svgsEnter.append('g').classed('nodeLayer', true);

    const self = this;
    svgs.each(function (d) { self.drawNodeLinkDiagram(d, d3.select(this)); });

    svgsEnter.on('click', d => {
      window.controller.toggleFilter(new SingletonFilter({
        transitionId: d.transitionId,
        responseType: this.responseType,
        key: 'exampleNetwork'
      }));
    });

    const humanResponseType = window.controller.getHumanResponseType(this.responseType);
    const isFilterTarget = window.controller.lookupFilter(`Specific response, filtered from ${humanResponseType}[exampleNetwork]`) !== -1;
    container.classed('filterTarget', isFilterTarget);

    if (this._notFirstRender) {
      for (const transition of filteredList) {
        this.simulations[transition.transitionId].alphaTarget(0.3).restart();
      }
    }
    this._notFirstRender = true;
  }
  drawNodeLinkDiagram (transition, svg) {
    const nodeRadius = 10;

    const parallelEdges = {};
    const edgeData = transition[this.responseType].exampleNetwork.edges
      .filter(d => d.source !== null && d.target !== null)
      .map((d, i) => {
        let key = d.source + '_' + d.target;
        if (parallelEdges[key]) {
          parallelEdges[key].push(i);
        } else {
          parallelEdges[key] = [i];
        }
        const copy = Object.assign({}, d);
        return copy;
      });
    for (const indices of Object.values(parallelEdges)) {
      if (indices.length === 1) {
        // Always bend solo edges a little (in the event other edges are
        // coming back)
        edgeData[indices[0]].parallelOffset = 0.25;
      } else {
        // Assign a unique offset from (0, 1] to each parallel edge
        // (the mirror side is reserved for the other direction)
        for (const [parallelIndex, edgeIndex] of indices.entries()) {
          edgeData[edgeIndex].parallelOffset = (parallelIndex + 1) / indices.length;
        }
      }
    }
    const nodeData = transition[this.responseType].exampleNetwork.nodes;
    const simulation = this.simulations[transition.transitionId];

    const bboxForce = alpha => {
      for (const node of nodeData) {
        if (node.x < nodeRadius) {
          node.x = nodeRadius;
          node.vx = Math.abs(node.vx);
        }
        if (node.x > this.svgSize - nodeRadius) {
          node.x = this.svgSize - nodeRadius;
          node.vx = -Math.abs(node.vx);
        }
        if (node.y < nodeRadius) {
          node.y = nodeRadius;
          node.vy = Math.abs(node.vy);
        }
        if (node.y > this.svgSize - nodeRadius) {
          node.y = this.svgSize - nodeRadius;
          node.vy = -Math.abs(node.vy);
        }
      }
    };
    simulation.nodes(nodeData)
      .force('link', d3.forceLink(edgeData).distance(() => 10 * nodeRadius))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(this.svgSize / 2, this.svgSize / 2))
      .force('bbox', bboxForce);
    const drag = d3.drag()
      .on('start', (d, i) => {
        if (!d3.event.active) {
          simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
          this._selectedTransitionId = transition.transitionId;
          this._selectedNode = i;
          this.render();
        }
      }).on('drag', d => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }).on('end', d => {
        if (!d3.event.active) {
          simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      });

    // Okay, actually start drawing
    let nodes = svg.select('.nodeLayer')
      .selectAll('.node').data(nodeData);
    nodes.exit().remove();
    const nodesEnter = nodes.enter().append('g')
      .classed('node', true);
    nodes = nodes.merge(nodesEnter);

    nodesEnter.append('circle')
      .attr('r', nodeRadius);
    nodesEnter.append('text')
      .attr('text-anchor', 'middle')
      .attr('y', `${nodeRadius + this.emSize}px`);
    nodes.select('text')
      .text(d => d.label);

    nodes.classed('selected', (d, i) => this._selectedTransitionId === transition.transitionId && this._selectedNode === i);
    nodes.call(drag);

    let edges = svg.select('.edgeLayer')
      .selectAll('.edge').data(edgeData);
    edges.exit().remove();
    const edgesEnter = edges.enter().append('g')
      .classed('edge', true);
    edges = edges.merge(edgesEnter);

    edgesEnter.append('path')
      .classed('hoverTarget', true);
    edgesEnter.append('path')
      .classed('visible', true);

    edges.classed('selected', (d, i) => this._selectedTransitionId === transition.transitionId && this._selectedEdge === i);
    edges.on('click', (d, i) => {
      this._selectedTransitionId = transition.transitionId;
      this._selectedEdge = i;
      this.render();
    });

    // Helper for computing edge paths
    const computeEdge = d => {
      let path;
      let outgoingAngle;
      let incomingAngle;
      let arrowheadAngle;
      if (d.source === d.target) {
        // This is a self edge; draw an arc from the node to itself

        // Outgoing angle range for parallel, self edges: (0, 2 * Math.PI]
        outgoingAngle = d.parallelOffset * 2 * Math.PI;
        // Self edges come back in offset 90 degrees
        incomingAngle = outgoingAngle + Math.PI / 2;
        // Tilt the arrowhead slightly back
        arrowheadAngle = incomingAngle - Math.PI / 10;
      } else {
        // Centered outgoingAngle points directly at the target node
        outgoingAngle = Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x);
        // Point the incoming angle the other way
        incomingAngle = outgoingAngle + Math.PI;
        // Offset parallel edges by (0, Math.PI / 3]
        outgoingAngle += d.parallelOffset * Math.PI / 3;
        incomingAngle -= d.parallelOffset * Math.PI / 3;
        arrowheadAngle = incomingAngle;
      }
      // Shorthand for outgoing / incoming distances
      const ox = nodeRadius * Math.cos(outgoingAngle);
      const oy = nodeRadius * Math.sin(outgoingAngle);
      const ix = nodeRadius * Math.cos(incomingAngle);
      const iy = nodeRadius * Math.sin(incomingAngle);

      // Outgoing point on the circle
      const x0 = d.source.x + ox;
      const y0 = d.source.y + oy;
      // First curve handle
      const xc0 = d.source.x + 5 * ox + ix;
      const yc0 = d.source.y + 5 * oy + iy;
      // Second curve handle
      const xc1 = d.target.x + 5 * ix + ox;
      const yc1 = d.target.y + 5 * iy + oy;
      // Incoming point on the circle
      const x1 = d.target.x + ix;
      const y1 = d.target.y + iy;
      // Resulting SVG path, and incomingAngle
      path = `M${x0},${y0}C${xc0},${yc0},${xc1},${yc1},${x1},${y1}`;
      if (d.directed) {
        // Draw an arrowhead
        // Tip of the arrowhead
        const x0 = d.target.x + nodeRadius * Math.cos(incomingAngle);
        const y0 = d.target.y + nodeRadius * Math.sin(incomingAngle);
        // Left arrowhead leg
        const x1 = x0 + nodeRadius * Math.cos(arrowheadAngle - Math.PI / 4);
        const y1 = y0 + nodeRadius * Math.sin(arrowheadAngle - Math.PI / 4);
        // Right arrowhead leg
        const x2 = x0 + nodeRadius * Math.cos(arrowheadAngle + Math.PI / 4);
        const y2 = y0 + nodeRadius * Math.sin(arrowheadAngle + Math.PI / 4);
        // Add the arrowhead to the path
        path += `M${x0},${y0}L${x1},${y1}M${x0},${y0}L${x2},${y2}`;
      }
      return path;
    };

    simulation.on('tick', () => {
      edges.select('.hoverTarget').attr('d', computeEdge);
      edges.select('.visible').attr('d', computeEdge);
      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }
  filterTransition (transition) {
    return transition.dasResponse.networkThinking !== 'Never';
  }
}

class NetworkResponseEtsView extends NetworkResponseDasView {
  constructor (div) {
    super(div);
    this.humanLabel = 'Alternative Network / Hierarchy Data Details';
    this.responseType = 'etsResponse';
  }
  filterTransition (transition) {
    return transition.etsResponse !== null &&
      transition.etsResponse.targetType === 'network';
  }
}
export { NetworkResponseDasView, NetworkResponseEtsView };
