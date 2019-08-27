/* globals d3 */
import SurveyView from '../SurveyView/SurveyView.js';

class NetworkView extends SurveyView {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/NetworkView/style.less' },
      { type: 'text', url: 'views/NetworkView/template.html' }
    ]);
    this.state = transform ? 'post' : 'init';
    this.humanLabel = 'Network / Tree Details';

    this._exampleData = {
      nodes: [],
      edges: []
    };
    this._selectedNode = null;
    this._selectedEdge = null;
  }
  getNewNode () {
    return {
      label: this.d3el.select('.new.node.field input').node().value || this._exampleData.nodes.length
    };
  }
  getNewEdge () {
    const sourceSelect = this.d3el.select('.new.edge.field .source').node();
    const targetSelect = this.d3el.select('.new.edge.field .target').node();
    return {
      source: sourceSelect.selectedIndex === 0 ? null : sourceSelect.value,
      target: targetSelect.selectedIndex === 0 ? null : targetSelect.value,
      directed: !!this.d3el.select('.new.edge.field .directed').node().checked
    };
  }
  get sufficientNodesAndEdges () {
    return this._exampleData.nodes.length >= 2 && this._exampleData.edges.length >= 2;
  }
  setup () {
    const state = this.state; // eslint-disable-line no-unused-vars
    this.d3el.html(eval('`' + this.resources[1] + '`')); // eslint-disable-line no-eval

    this.d3el.select('.create.node.button').on('click', () => {
      this._exampleData.nodes.push(this.getNewNode());
      this._nodesChanged = true;
      this.render();
    });
    this.d3el.select('.create.edge.button').on('click', () => {
      const newEdge = this.getNewEdge();
      if (newEdge.source !== null && newEdge.target !== null) {
        this._exampleData.edges.push(newEdge);
        this._edgesChanged = true;
        this.render();
      }
    });
    this.d3el.selectAll('.new.edge.field .source, .new.edge.field .target')
      .on('change', () => { this.render(); });

    this._nodesChanged = true;
    this._edgesChanged = true;
    this.simulation = d3.forceSimulation()
      .force('charge', d3.forceManyBody());

    super.collectKeyElements();
  }
  draw () {
    this.enableButtons();
    this.drawNodeFields();
    this.drawEdgeFields();
    this.populateSelectMenus(this.d3el.select('.new.edge.field .source'), 'source');
    this.populateSelectMenus(this.d3el.select('.new.edge.field .target'), 'target');
    this.populateSelectMenus(this.d3el.selectAll('.edgeFields .source'), 'source', d => d.source);
    this.populateSelectMenus(this.d3el.selectAll('.edgeFields .target'), 'target', d => d.target);
    this.drawNodeLinkDiagram();
  }
  enableButtons () {
    const newEdge = this.getNewEdge();
    this.d3el.select('.create.edge.button')
      .classed('disabled', newEdge.source === null || newEdge.target === null);
  }
  drawNodeFields () {
    let nodes = this.d3el.select('.nodeFields')
      .selectAll('.field').data(this._exampleData.nodes);
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

    // <div class="create node button"><a></a><span class="label">Create Edge</span></div>
    nodesEnter.append('input')
      .attr('data-key', `${this.state}ExampleData`)
      .attr('data-role', (d, i) => `node${i}`)
      .attr('id', (d, i) => `${this.state}node${i}`);
    const self = this;
    function updateLabel (d) {
      d.label = this.value;
      self.render();
    }
    nodes.select('input')
      .property('value', d => d.label)
      .on('change', updateLabel)
      .on('keyup', updateLabel);

    const buttonEnter = nodesEnter.append('div')
      .classed('button', true);
    buttonEnter.append('a');
    buttonEnter.append('span')
      .classed('label', true)
      .text('Delete');
    buttonEnter.on('click', (d, i) => {
      this._exampleData.nodes.splice(i, 1);
      // TODO: fix all edge references, and delete edges that pointed to this node
      this._nodesChanged = true;
      this._edgesChanged = true;
      this.render();
    });
  }
  drawEdgeFields () {
    let edges = this.d3el.select('.edgeFields')
      .selectAll('.field').data(this._exampleData.edges);
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
      .attr('data-key', `${this.state}ExampleData`)
      .attr('data-role', (d, i) => `edge${i}source`)
      .attr('id', (d, i) => `${this.state}edge${i}source`);
    edgesEnter.append('select')
      .classed('target', true)
      .attr('data-key', `${this.state}ExampleData`)
      .attr('data-role', (d, i) => `edge${i}target`)
      .attr('id', (d, i) => `${this.state}edge${i}target`);
    const checkboxChunk = edgesEnter.append('div');
    checkboxChunk.append('input')
      .attr('type', 'checkbox')
      .attr('data-key', `${this.state}ExampleData`)
      .attr('data-role', (d, i) => `edge${i}directed`)
      .attr('id', (d, i) => `${this.state}edge${i}directed`);
    edges.select('[type="checkbox"]')
      .attr('checked', d => d.directed ? '' : null)
      .on('change', d => {
        d.directed = !d.directed;
        this.render();
      });
    checkboxChunk.append('label')
      .attr('for', (d, i) => `${this.state}edge${i}directed`)
      .text('Directed');

    const buttonEnter = edgesEnter.append('div')
      .classed('button', true);
    buttonEnter.append('a');
    buttonEnter.append('span')
      .classed('label', true)
      .text('Delete');
    buttonEnter.on('click', (d, i) => {
      this._exampleData.edges.splice(i, 1);
      this._edgesChanged = true;
      if (this._selectedEdge === i) {
        this._selectedEdge = null;
      } else if (this._selectedEdge !== null && this._selectedEdge > i) {
        this._selectedEdge -= 1;
      }
      this.render();
    });
  }
  populateSelectMenus (selectMenus, type, valueFunc) {
    let options = selectMenus.selectAll('option')
      .data([null].concat(this._exampleData.nodes.map((node, index) => { return { node, index }; })));
    options.exit().remove();
    const optionsEnter = options.enter().append('option');
    options = options.merge(optionsEnter);

    options.attr('disabled', d => d === null ? true : null)
      .text(d => d === null ? `Choose a ${type} node` : d.node.label);

    if (valueFunc) {
      selectMenus.property('value', valueFunc);
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

    // Make copies so that d3 doesn't corrupt the "pure" submission data; also
    // we tack on our own helper stuff (e.g. to separate parallel / self edges)
    const nodeData = this._exampleData.nodes.map(d => Object.create(d));
    const edgeData = this._exampleData.edges.map(d => Object.create(d));

    // TODO: flag parallel / self edges

    this.simulation.force('center', d3.forceCenter(bounds.width / 2, height / 2));
    this.simulation.nodes(nodeData);
    this.simulation.force('link', d3.forceLink(edgeData));
    if (this._nodesChanged || this._edgesChanged) {
      this.simulation.alphaTarget(0.3).restart();
      this._nodesChanged = false;
      this._edgesChanged = false;
    } else {
      this.simulation.stop();
    }

    let nodes = this.d3el.select('.nodeLayer')
      .selectAll('.node').data(nodeData);
    nodes.exit().remove();
    const nodesEnter = nodes.enter().append('g')
      .classed('node', true);
    nodes = nodes.merge(nodesEnter);

    nodesEnter.append('circle')
      .attr('r', 6);

    nodes.classed('selected', (d, i) => this._selectedNode === i);
    nodes.on('click', (d, i) => {
      this._selectedNode = i;
      this.render();
    });

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

    this.simulation.on('tick', () => {
      edges.selectAll('path')
        .attr('d', d => {
          return `M${d.source.x},${d.source.y}L${d.target.x},${d.target.y}`;
        });
      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });
  }
  isEnabled (formValues) {
    return this.state === 'init' && formValues.datasetType === 'Network';
  }
  validateForm (formValues) {
    formValues[`${this.state}ExampleData`] = this._exampleData;
    return {
      valid: true,
      invalidIds: {}
    };
  }
}
export default NetworkView;
