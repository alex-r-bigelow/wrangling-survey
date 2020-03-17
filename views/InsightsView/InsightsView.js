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

    this.margin = { top: 4 * this.emSize, right: 0, bottom: 0, left: 6 * this.emSize };
    this.width = 600;
    this.height = 450;

    const svg = this.d3el.select('.heatmap')
      .attr('width', this.width)
      .attr('height', this.height);
    this.d3el.selectAll('.container, .x.axis, .y.axis')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    // Labels of row and columns
    this.datasetTypes = ['tabular', 'network', 'spatial', 'grouped', 'textual', 'media'];

    // Labels that count as "I think of my data as..."
    this.sourceThreshold = ['Always'];
    // Labels that count as "... but I also <> think about it as..."
    this.targetThreshold = ['Sometimes', 'Very often', 'Always'];

    // Build X scales and axis:
    this.x = d3.scaleBand()
      .range([ 0, this.width - this.margin.left - this.margin.right ])
      .domain(this.datasetTypes)
      .padding(0.01);
    svg.select('.x.axis')
      .call(d3.axisTop(this.x));
    svg.select('.x.label')
      .attr('transform', `translate(${this.margin.left + (this.width - this.margin.left - this.margin.right) / 2},${2 * this.emSize})`)
      .text(`... but I ${this.targetThreshold.join('/')} think about it as ___`);

    // Build X scales and axis:
    this.y = d3.scaleBand()
      .range([ this.height - this.margin.top - this.margin.bottom, 0 ])
      .domain(Array.from(this.datasetTypes).reverse())
      .padding(0.01);
    svg.select('.y.axis')
      .call(d3.axisLeft(this.y));
    svg.select('.y.label')
      .attr('transform', `translate(${2 * this.emSize},${this.margin.top + (this.height - this.margin.top - this.margin.bottom) / 2}) rotate(-90)`)
      .text(`I think of my data as ${this.sourceThreshold.join('/')}...`);

    // Build color scale
    this.myColor = d3.scaleLinear()
      .range(['white', '#ab0520']) // I stole this color from /style/colors.less, @ArizonaRed. Feel free to revert: '#bb1244']) // '#69b3a2'])
      .domain([0, 1]);
  }
  setupViewFilter () {
    // Overriding no-op; this view doesn't need a checkbox in its header
  }
  drawViewFilter () {
    // Overriding no-op; this view doesn't need a checkbox in its header
  }
  draw () {
    const { fullList, filteredList } = this.getTransitionLists(); // eslint-disable-line no-unused-vars

    const container = this.d3el.select('.heatmap .container');

    const data = this.deriveCells(filteredList);

    let cells = container.selectAll('.cell')
      .data(data, d => d.sourceCategory + ':' + d.targetCategory);
    cells.exit().remove();
    const cellsEnter = cells.enter().append('g')
      .classed('cell', true);
    cells = cells.merge(cellsEnter);

    cellsEnter.append('rect');
    cells.select('rect')
      .attr('x', d => this.x(d.targetCategory))
      .attr('y', d => this.y(d.sourceCategory))
      .attr('width', this.x.bandwidth())
      .attr('height', this.y.bandwidth())
      .style('fill', d => d.sourceCount === d.targetCount ? 'white' : this.myColor(d.targetCount / d.sourceCount));

    cellsEnter.append('text');
    cells.select('text')
      .attr('x', d => this.x(d.targetCategory) + (this.x.bandwidth() / 2))
      .attr('y', d => this.y(d.sourceCategory) + (this.y.bandwidth() / 2))
      .attr('dy', '0.35em')
      .text(d => `${d.targetCount}/${d.sourceCount}`);
  }
  deriveCells (filteredList) {
    const data = [];
    for (const sourceCategory of this.datasetTypes) {
      for (const targetCategory of this.datasetTypes) {
        let sourceCount = 0;
        let targetCount = 0;
        const seenResponses = {};
        for (const transition of filteredList) {
          if (seenResponses[transition.dasResponse.submitTimestamp]) {
            continue;
          }
          seenResponses[transition.dasResponse.submitTimestamp] = true;
          if (this.sourceThreshold.indexOf(transition.dasResponse[sourceCategory + 'Thinking']) !== -1) {
            // Only looking at responses that picked a value in this.sourceThreshold
            sourceCount += 1;

            // ... did they also pick a value in this.targetThreshold?
            if (this.targetThreshold.indexOf(transition.dasResponse[targetCategory + 'Thinking']) !== -1) {
              targetCount += 1;
            }
          }
          data.push({
            sourceCategory,
            targetCategory,
            sourceCount,
            targetCount
          });
        }
      }
    }
    return data;
  }
}
export default InsightsView;
