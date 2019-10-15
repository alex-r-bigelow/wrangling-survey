/* globals d3 */
import SurveyView from '../SurveyView/SurveyView.js';

class NetworkView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/NetworkView/style.less' },
      { type: 'text', url: 'views/NetworkView/template.html' }
    ]);
    this.humanLabel = '<span class="inspectable">Network</span> / <span class="inspectable">Hierarchy</span> Data Details';
    this.dataTypeLabel = '<span class="inspectable">network</span> / <span class="inspectable">hierarchical</span>';

    this.on('open', () => {
      this._justOpened = true;
      this.render();
    });
  }
  getNewNode () {
    return {
      label: this.d3el.select('.new.node.field input').node().value || this._exampleNetwork.nodes.length
    };
  }
  getNewEdge () {
    const sourceSelect = this.d3el.select('.new.edge.field .source').node();
    const targetSelect = this.d3el.select('.new.edge.field .target').node();
    return {
      source: sourceSelect.selectedIndex === 0 ? null : parseInt(sourceSelect.value),
      target: targetSelect.selectedIndex === 0 ? null : parseInt(targetSelect.value),
      directed: !!this.d3el.select('.new.edge.field .directed').node().checked
    };
  }
  get sufficientNodesAndEdges () {
    return this._exampleNetwork.nodes.length >= 2 && this._exampleNetwork.edges.length >= 2;
  }
  populateForm (formValues) {
    super.populateForm(formValues);
    if (formValues['exampleNetwork']) {
      this.populateNetwork(formValues['exampleNetwork']);
      // The DOM will have been nuked by super.populateForm; force an immediate draw
      this.draw();
    }
  }
  parseFormNetwork (rawFields) {
    // Reshape the extracted exampleNetwork into its actual form
    const nodes = [];
    let edges = {};
    for (const [key, value] of Object.entries(rawFields)) {
      const nodeMatch = key.match(/node(\d+)/);
      if (nodeMatch) {
        nodes.push({ label: value, index: parseInt(nodeMatch[1]) });
      } else {
        const edgeMatch = key.match(/edge(\d+)(.*)/);
        const index = edgeMatch[1];
        edges[index] = edges[index] || { index: parseInt(index) };
        if (edgeMatch[2] === 'source') {
          edges[index].source = parseInt(value);
        } else if (edgeMatch[2] === 'target') {
          edges[index].target = parseInt(value);
        } else {
          edges[index].directed = value;
        }
      }
    }
    nodes.sort((a, b) => a.index - b.index).forEach(node => { delete node.index; });
    edges = Object.values(edges);
    edges.sort((a, b) => a.index - b.index).forEach(edge => { delete edge.index; });
    return { nodes, edges };
  }
  populateNetwork (exampleNetwork) {
    this._exampleNetwork = exampleNetwork;
    this._selectedNode = null;
    this._selectedEdge = null;

    this._nodesChanged = true;
    this._edgesChanged = true;
    this.render();
  }
  setup () {
    this.d3el.html(this.resources[1]);

    if (!this._exampleNetwork) {
      // Start out with a graph, so that people aren't confronted with
      // an empty canvas
      this.populateNetwork({
        nodes: [
          { label: 'Please' },
          { label: 'change' },
          { label: 'me' }
        ],
        edges: [
          { source: 0, target: 1, directed: true },
          { source: 1, target: 2, directed: true }
        ]
      });
    }

    this.d3el.select('.create.node.button').on('click', () => {
      this._exampleNetwork.nodes.push(this.getNewNode());
      this._nodesChanged = true;
      this.render();
    });
    this.d3el.select('.create.edge.button').on('click', () => {
      const newEdge = this.getNewEdge();
      if (newEdge.source !== null && newEdge.target !== null) {
        this._exampleNetwork.edges.push(newEdge);
        this._edgesChanged = true;
        this.render();
      }
    });
    this.d3el.selectAll('.new.edge.field .source, .new.edge.field .target')
      .on('change', () => { this.render(); });

    this.simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody());

    this.setupProtest();
    this.setupLikertFields();
    this.collectKeyElements();
  }
  draw () {
    super.draw();
    this.drawNodeFields();
    this.drawEdgeFields();
    this.populateSelectMenus(this.d3el.select('.new.edge.field .source'), 'source');
    this.populateSelectMenus(this.d3el.select('.new.edge.field .target'), 'target');
    this.populateSelectMenus(this.d3el.selectAll('.edgeFields .source'), 'source', d => d.source);
    this.populateSelectMenus(this.d3el.selectAll('.edgeFields .target'), 'target', d => d.target);
    this.enableButtons(); // Important that this comes after populateSelectMenus
    this.drawNodeLinkDiagram();
    if (this._nodesChanged || this._edgesChanged || this._justOpened) {
      // Restart the simulation in any of the above scenarios, redo our list
      // of key elements / their event listeners, and then clear those flags
      this.simulation.alphaTarget(0.3).restart();
      this.collectKeyElements();
      this.setupSurveyListeners();
      this._nodesChanged = false;
      this._edgesChanged = false;
      this._justOpened = false;
    }
  }
  enableButtons () {
    const newEdge = this.getNewEdge();
    this.d3el.select('.create.edge.button')
      .classed('disabled', newEdge.source === null || newEdge.target === null);
  }
  deleteEdge (index) {
    // Delete the edge
    this._exampleNetwork.edges.splice(index, 1);
    this._edgesChanged = true;

    // Fix the _selectedEdge pointer if it was messed up
    if (this._selectedEdge === index) {
      this._selectedEdge = null;
    } else if (this._selectedEdge !== null && this._selectedEdge > index) {
      this._selectedEdge -= 1;
    }
  }
  deleteNode (index) {
    // First, delete any edges that reference this node, or update edges that
    // reference higher-indexed nodes
    let i = 0;
    while (i < this._exampleNetwork.edges.length) {
      const edge = this._exampleNetwork.edges[i];
      if (edge.source === index || edge.target === index) {
        this.deleteEdge(i);
      } else {
        if (edge.source > index) {
          edge.source -= 1;
        }
        if (edge.target > index) {
          edge.target -= 1;
        }
        i++;
      }
    }

    // Delete the node
    this._exampleNetwork.nodes.splice(index, 1);
    this._nodesChanged = true;

    // Fix the _selectedNode pointer if it was messed up
    if (this._selectedNode === index) {
      this._selectedNode = null;
    } else if (this._selectedNode !== null && this._selectedNode > index) {
      this._selectedNode -= 1;
    }
  }
  drawNodeFields () {
    let nodes = this.d3el.select('.nodeFields').selectAll('.field')
      .data(this._exampleNetwork.nodes, node => JSON.stringify(node));
    nodes.exit().remove();
    const nodesEnter = nodes.enter().append('div')
      .classed('node', true)
      .classed('field', true);
    nodes = nodesEnter.merge(nodes);

    nodes
      .classed('selected', (d, i) => this._selectedNode === i)
      .on('click', (d, i) => {
        this._selectedNode = i;
        this.render();
      });

    nodesEnter.append('input')
      .attr('data-key', 'exampleNetwork')
      .attr('data-role', (d, i) => `node${i}`)
      .attr('id', (d, i) => `node${i}`);
    nodes.select('input')
      .property('value', d => d.label);

    const buttonEnter = nodesEnter.append('div')
      .classed('button', true);
    buttonEnter.append('a');
    buttonEnter.append('span')
      .classed('label', true)
      .text('Delete');
    buttonEnter.on('click', (d, i) => {
      this.deleteNode(i);
      this.render();
    });
  }
  drawEdgeFields () {
    let edges = this.d3el.select('.edgeFields').selectAll('.field')
      .data(this._exampleNetwork.edges, edge => JSON.stringify(edge));
    edges.exit().remove();
    const edgesEnter = edges.enter().append('div')
      .classed('edge', true)
      .classed('field', true);
    edges = edgesEnter.merge(edges);

    edges
      .classed('selected', (d, i) => this._selectedEdge === i)
      .on('click', (d, i) => {
        this._selectedEdge = i;
        this.render();
      });

    // <div class="create node button"><a></a><span class="label">Create Edge</span></div>
    edgesEnter.append('select')
      .classed('source', true)
      .attr('data-key', 'exampleNetwork')
      .attr('data-role', (d, i) => `edge${i}source`)
      .attr('id', (d, i) => `edge${i}source`);
    edgesEnter.append('select')
      .classed('target', true)
      .attr('data-key', 'exampleNetwork')
      .attr('data-role', (d, i) => `edge${i}target`)
      .attr('id', (d, i) => `edge${i}target`);
    const checkboxChunk = edgesEnter.append('div');
    checkboxChunk.append('input')
      .attr('type', 'checkbox')
      .attr('data-key', 'exampleNetwork')
      .attr('data-role', (d, i) => `edge${i}directed`)
      .attr('id', (d, i) => `edge${i}directed`);
    edges.select('[type="checkbox"]')
      .property('checked', d => d.directed);
    checkboxChunk.append('label')
      .attr('for', (d, i) => `edge${i}directed`)
      .text('Directed');

    const buttonEnter = edgesEnter.append('div')
      .classed('button', true);
    buttonEnter.append('a');
    buttonEnter.append('span')
      .classed('label', true)
      .text('Delete');
    buttonEnter.on('click', (d, i) => {
      this.deleteEdge(i);
      this.render();
    });
  }
  populateSelectMenus (selectMenus, type, valueFunc) {
    const optionList = [null].concat(this._exampleNetwork.nodes
      .map((node, index) => { return { node, index }; }));
    let options = selectMenus.selectAll('option').data(optionList);
    options.exit().remove();
    const optionsEnter = options.enter().append('option');
    options = options.merge(optionsEnter);

    options.attr('disabled', d => d === null ? true : null)
      .property('value', (d, i) => d === null ? 'null' : i - 1)
      .text(d => d === null ? `Choose a ${type} node` : d.node.label);

    if (this._nodesChanged || this._edgesChanged || this._justOpened) {
      if (optionList.length === 1) {
        selectMenus.property('selectedIndex', 0);
      } else if (valueFunc) {
        selectMenus.property('value', valueFunc);
      }
    }
  }
  drawNodeLinkDiagram () {
    this.d3el.select('.insufficientNodesAndEdges')
      .style('display', this.sufficientNodesAndEdges ? 'none' : null);

    const bounds = this.d3el.node().getBoundingClientRect();
    const height = 200;
    this.d3el.select('svg')
      .attr('width', bounds.width)
      .attr('height', height);
    const nodeRadius = 10;

    // We start by assuming that no data has changed, and that we're just
    // re-using the data already bound to the existing nodes / edges
    let nodeData = this.d3el.select('.nodeLayer').selectAll('.node').data();
    let edgeData = this.d3el.select('.edgeLayer').selectAll('.edge').data();
    if (this._nodesChanged || this._edgesChanged) {
      // Some data was changed, so create copies of our "pure" nodes (so that
      // d3's additions don't corrupt them), and attempt to preserve any prior
      // node positions / velocities / fixed states that were there before (to
      // avoid jitter)
      const propertiesToCopy = ['x', 'y', 'vx', 'vy', 'fx', 'fy'];
      nodeData = this._exampleNetwork.nodes.map((d, i) => {
        const copy = Object.assign({}, d);
        if (i < nodeData.length) {
          for (const prop of propertiesToCopy) {
            copy[prop] = nodeData[i][prop];
          }
        }
        return copy;
      });
      // We can just create edge copies from scratch (d3 will reshape them
      // anyway). While we're at it, attach flags to self-edges and parallel
      // edges so that we know how to draw them later
      const parallelEdges = {};
      edgeData = this._exampleNetwork.edges.map((d, i) => {
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

      // Let d3 do its transformation of the objects
      this.simulation.nodes(nodeData)
        .force('link', d3.forceLink(edgeData).distance(() => 10 * nodeRadius));
    }

    // Update the forces that care about bounding boxes / need references to the
    // data
    const bboxForce = alpha => {
      for (const node of nodeData) {
        if (node.x < nodeRadius) {
          node.x = nodeRadius;
          node.vx = Math.abs(node.vx);
        }
        if (node.x > bounds.width - nodeRadius) {
          node.x = bounds.width - nodeRadius;
          node.vx = -Math.abs(node.vx);
        }
        if (node.y < nodeRadius) {
          node.y = nodeRadius;
          node.vy = Math.abs(node.vy);
        }
        if (node.y > height - nodeRadius) {
          node.y = height - nodeRadius;
          node.vy = -Math.abs(node.vy);
        }
      }
    };
    this.simulation
      .force('center', d3.forceCenter(bounds.width / 2, height / 2))
      .force('bbox', bboxForce);
    const drag = d3.drag()
      .on('start', (d, i) => {
        if (!d3.event.active) {
          this.simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
          this._selectedNode = i;
          this.render();
        }
      }).on('drag', d => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }).on('end', d => {
        if (!d3.event.active) {
          this.simulation.alphaTarget(0);
        }
        d.fx = null;
        d.fy = null;
      });

    // Okay, actually start drawing
    let nodes = this.d3el.select('.nodeLayer')
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

    nodes.classed('selected', (d, i) => this._selectedNode === i);
    nodes.call(drag);

    let edges = this.d3el.select('.edgeLayer')
      .selectAll('.edge').data(edgeData);
    edges.exit().remove();
    const edgesEnter = edges.enter().append('g')
      .classed('edge', true);
    edges = edges.merge(edgesEnter);

    edgesEnter.append('path')
      .classed('hoverTarget', true);
    edgesEnter.append('path')
      .classed('visible', true);

    edges.classed('selected', (d, i) => this._selectedEdge === i);
    edges.on('click', (d, i) => {
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

    this.simulation.on('tick', () => {
      edges.select('.hoverTarget').attr('d', computeEdge);
      edges.select('.visible').attr('d', computeEdge);
      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }
  isEnabled (formValues) {
    return (formValues.networkThinking && formValues.networkThinking !== 'Never') ||
      (window.controller.params && window.controller.params.targetType === 'network');
  }
  validateForm (formValues) {
    formValues.exampleNetwork = this.parseFormNetwork(formValues.exampleNetwork);
    this.populateNetwork(formValues.exampleNetwork);

    const invalidIds = super.requireFields(formValues, [
      'nodeClassCount',
      'edgeClassCount',
      'edgeDirection'
    ]);
    return { valid: Object.keys(invalidIds).length === 0, invalidIds };
  }
}
export default NetworkView;
