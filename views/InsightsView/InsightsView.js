/* globals d3 */
import VisView from '../VisView/VisView.js';

class InsightsView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'text', url: 'views/InsightsView/template.html' },
      { type: 'less', url: 'views/InsightsView/style.less' }
    ]);
    this.humanLabel = 'Insights';
  }
  setup () {
    this.d3el.html(this.resources[0]);
    super.setup();

    this.setupTimestamps();
    this.setupHeatMap();
  }
  draw () {
    const { fullList, filteredList } = this.getTransitionLists(); // eslint-disable-line no-unused-vars

    this.drawTimestamps(fullList, filteredList);
    this.drawHeatMap(filteredList);
  }

  setupViewFilter () {
    // Overriding no-op; this view doesn't need a checkbox in its header
  }
  drawViewFilter () {
    // Overriding no-op; this view doesn't need a checkbox in its header
  }

  /* timestamps code */
  setupTimestamps () {

  }
  drawTimestamps (fullList, filteredList) {

  }

  /* heatmap code */
  get sourceThreshold () {
    if (!this._sourceThreshold) {
      this._sourceThreshold = this.d3el.select('.source')
        .selectAll(':checked').nodes().map(el => {
          return el.dataset.value;
        });
    }
    return this._sourceThreshold;
  }
  get targetThreshold () {
    if (!this._targetThreshold) {
      this._targetThreshold = this.d3el.select('.target')
        .selectAll(':checked').nodes().map(el => {
          return el.dataset.value;
        });
    }
    return this._targetThreshold;
  }
  setupHeatMap () {
    this.minHeatmapHeight = 450;
    this.defaultMargins = {
      top: 4 * this.emSize,
      right: 0,
      bottom: 0,
      left: 6 * this.emSize
    };
    const parentBounds = this.d3el.node().getBoundingClientRect();

    const width = parentBounds.width;
    const height = this.minHeatmapHeight;

    const svg = this.d3el.select('.heatmap')
      .attr('width', width)
      .attr('height', height);

    // Ensure that the y label is initially vertical, so that the first call
    // to getBoundingClientRect() correctly determines its height
    svg.select('.heatmap .y.label')
      .attr('transform', 'rotate(-90)');

    // Labels of row and columns
    this.datasetTypes = ['tabular', 'network', 'spatial', 'grouped', 'textual', 'media'];

    // Build X scales and axis:
    this.heatMapX = d3.scaleBand()
      .domain(this.datasetTypes)
      .padding(0.01);

    // Build X scales and axis:
    this.heatMapY = d3.scaleBand()
      .domain(Array.from(this.datasetTypes).reverse())
      .padding(0.01);

    // Build color scale
    this.heatMapColor = d3.scaleLinear()
      .range(['white', '#ab0520']) // I stole this color from /style/colors.less, @ArizonaRed. Feel free to revert: '#bb1244']) // '#69b3a2'])
      .domain([0, 1]);

    // Attach event listeners
    this.d3el.selectAll('input[type="checkbox"]')
      .on('click', () => {
        delete this._sourceThreshold;
        delete this._targetThreshold;
        this.render();
      });
  }
  drawHeatMap (filteredList) {
    const data = this.deriveCells(filteredList);

    const yLabel = this.d3el.select('.heatmap .y.label')
      .text(`When participants ${this.sourceThreshold.join('/')} thought of data as...`);
    const xLabel = this.d3el.select('.heatmap .x.label')
      .text(`... they also ${this.targetThreshold.join('/')} thought of it as:`);

    const parentBounds = this.d3el.node().getBoundingClientRect();
    const width = Math.max(parentBounds.width, xLabel.node().getBoundingClientRect().width);
    const height = Math.max(this.minHeatmapHeight, yLabel.node().getBoundingClientRect().height);

    const xOffset = Math.max(0, width - parentBounds.width);
    const yOffset = Math.max(0, height - this.minHeatmapHeight);

    const margins = {
      top: this.defaultMargins.top + yOffset,
      right: this.defaultMargins.right,
      bottom: this.defaultMargins.bottom,
      left: this.defaultMargins.left + xOffset
    };

    this.d3el.select('.heatmap')
      .attr('width', width)
      .attr('height', height);
    this.d3el.selectAll('.container, .x.axis, .y.axis')
      .attr('transform', `translate(${margins.left},${margins.top})`);
    xLabel.attr('transform',
      `translate(${width / 2},${2 * this.emSize + yOffset})`);
    yLabel.attr('transform',
      `translate(${2 * this.emSize + xOffset},${height / 2}) rotate(-90)`);

    this.heatMapX.range([ 0, width - margins.left - margins.right ]);
    this.heatMapY.range([ height - margins.top - margins.bottom, 0 ]);

    this.d3el.select('.heatmap .x.axis')
      .call(d3.axisTop(this.heatMapX));
    this.d3el.select('.heatmap .y.axis')
      .call(d3.axisLeft(this.heatMapY));

    const container = this.d3el.select('.heatmap .container');
    let cells = container.selectAll('.cell')
      .data(data, d => d.sourceCategory + ':' + d.targetCategory);
    cells.exit().remove();
    const cellsEnter = cells.enter().append('g')
      .classed('cell', true);
    cells = cells.merge(cellsEnter);

    cellsEnter.append('rect');
    cells.select('rect')
      .attr('x', d => this.heatMapX(d.targetCategory))
      .attr('y', d => this.heatMapY(d.sourceCategory))
      .attr('width', this.heatMapX.bandwidth())
      .attr('height', this.heatMapY.bandwidth())
      .style('fill', d => d.sourceCategory === d.targetCategory ? 'none' : this.heatMapColor(d.targetCount / d.sourceCount));

    cellsEnter.append('text');
    cells.select('text')
      .attr('x', d => this.heatMapX(d.targetCategory) + (this.heatMapX.bandwidth() / 2))
      .attr('y', d => this.heatMapY(d.sourceCategory) + (this.heatMapY.bandwidth() / 2))
      .attr('dy', '0.35em')
      .text(d => `${d.targetCount}/${d.sourceCount}`);
  }
  deriveCells (filteredList) {
    const sourceCounts = {};
    const targetCounts = {};
    const seenResponses = {};
    for (const transition of filteredList) {
      if (seenResponses[transition.dasResponse.submitTimestamp]) {
        continue;
      }
      seenResponses[transition.dasResponse.submitTimestamp] = true;
      for (const sourceCategory of this.datasetTypes) {
        sourceCounts[sourceCategory] = sourceCounts[sourceCategory] || 0;
        targetCounts[sourceCategory] = targetCounts[sourceCategory] || {};

        // Only looking at responses that picked a value in this.sourceThreshold
        if (this.sourceThreshold.indexOf(transition.dasResponse[sourceCategory + 'Thinking']) !== -1) {
          sourceCounts[sourceCategory] += 1;

          for (const targetCategory of this.datasetTypes) {
            targetCounts[sourceCategory][targetCategory] = targetCounts[sourceCategory][targetCategory] || 0;

            // ... did they also pick a value in this.targetThreshold?
            if (this.targetThreshold.indexOf(transition.dasResponse[targetCategory + 'Thinking']) !== -1) {
              targetCounts[sourceCategory][targetCategory] += 1;
            }
          }
        }
      }
    }
    const data = [];
    for (const sourceCategory of this.datasetTypes) {
      for (const targetCategory of this.datasetTypes) {
        const temp = targetCounts[sourceCategory] || {};
        data.push({
          sourceCategory,
          targetCategory,
          sourceCount: sourceCounts[sourceCategory] || 0,
          targetCount: temp[targetCategory] || 0
        });
      }
    }
    return data;
  }
}

export default InsightsView;
