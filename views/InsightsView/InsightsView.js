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

    this.setupOverview();
    this.setupDetail();
    this.setupHeatMap();
  }
  draw () {
    const { fullList, filteredList } = this.getTransitionLists(); // eslint-disable-line no-unused-vars

    if (fullList.length > 0) {
      this.drawOverview(fullList, filteredList);
      this.drawDetail(fullList, filteredList);
      this.drawHeatMap(filteredList);
    }
  }

  setupViewFilter () {
    // Overriding no-op; this view doesn't need a checkbox in its header
  }
  drawViewFilter () {
    // Overriding no-op; this view doesn't need a checkbox in its header
  }

  /* timestamps code */
  getTimestampMode () {
    const selectMenu = this.d3el.select('.timestampMode').node();
    return selectMenu.options[selectMenu.selectedIndex].dataset;
  }
  setupOverview () {
    this.overviewHeight = 150;
    this.overviewMargins = {
      top: 0,
      right: 0.5 * this.emSize,
      bottom: 2 * this.emSize,
      left: 2 * this.emSize
    };

    this.overviewX = d3.scaleTime();
    this.overviewY = d3.scaleLinear().range([
      this.overviewHeight - this.overviewMargins.bottom,
      this.overviewMargins.top
    ]);

    this.d3el.select('.overview .x.axis')
      .attr('transform', `translate(${this.overviewMargins.left},${this.overviewHeight - this.overviewMargins.bottom})`);
    this.d3el.selectAll('.overview .y.axis, .overview .fullBins, .overview .filteredBins, .overview .brush')
      .attr('transform', `translate(${this.overviewMargins.left},${this.overviewMargins.top})`);

    this.overviewBrush = d3.brushX()
      .on('brush', () => {

      })
      .on('end', () => {
        if (d3.event.selection && d3.event.sourceEvent) {
          this.detailX.domain(d3.event.selection.map(this.overviewX.invert)
            .sort((a, b) => a - b));
        }
        this.render();
      });
  }
  drawOverview (fullList, filteredList) {
    const width = this.d3el.node().getBoundingClientRect().width;

    const { dataset, key } = this.getTimestampMode();

    this.overviewX
      .range([
        0,
        Math.max(1, width - this.overviewMargins.left - this.overviewMargins.right)
      ])
      .domain(d3.extent(fullList, transition => transition[dataset] &&
        new Date(transition[dataset][key])))
      .nice(20)
      .clamp(true);

    this.d3el.select('.overview')
      .attr('width', width)
      .attr('height', this.overviewHeight);

    this.drawHistogram(
      fullList,
      filteredList,
      this.overviewX,
      this.overviewY,
      this.d3el.select('.overview')
    );

    this.overviewBrush.extent([[0, 0], [
      Math.max(1, width - this.overviewMargins.left - this.overviewMargins.right),
      Math.max(1, this.overviewHeight - this.overviewMargins.top - this.overviewMargins.bottom)]
    ]);
    this.d3el.select('.overview .brush')
      .call(this.overviewBrush);
    this.updateOverviewBrush();
  }
  updateOverviewBrush () {
    if (!this._detailDomainInitialized) {
      // Start the detail view at 1/3 the span of the overview
      let detailDomain = this.overviewX.domain();
      detailDomain[1] = new Date((+detailDomain[0]) + (detailDomain[1] - detailDomain[0]) / 3);
      this.detailX.domain(detailDomain);
      this._detailDomainInitialized = true;
    }
    const detailScreenCoords = this.detailX.domain()
      .map(this.overviewX)
      .sort((a, b) => a - b);
    this.d3el.select('.overview .brush')
      .call(this.overviewBrush.move, detailScreenCoords);
  }
  setupDetail () {
    this.detailHeight = 350;
    this.detailMargins = {
      top: 0,
      right: 0.5 * this.emSize,
      bottom: 2 * this.emSize,
      left: 2 * this.emSize
    };

    this.detailX = d3.scaleTime();
    this.detailY = d3.scaleLinear().range([
      this.detailHeight - this.detailMargins.bottom,
      this.detailMargins.top
    ]);

    this.d3el.select('.detail .x.axis')
      .attr('transform', `translate(${this.detailMargins.left},${this.detailHeight - this.detailMargins.bottom})`);
    this.d3el.selectAll('.detail .y.axis, .detail .fullBins, .detail .filteredBins')
      .attr('transform', `translate(${this.detailMargins.left},${this.detailMargins.top})`);

    this.detailZoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .on('zoom', () => {

      });

    this.d3el.select('.timestampMode').on('change', () => {
      this.render();
    });
  }
  drawDetail (fullList, filteredList) {
    const width = this.d3el.node().getBoundingClientRect().width;

    this.detailX.range([
      0,
      Math.max(1, width - this.detailMargins.left - this.detailMargins.right)
    ]);
    this.detailZoom
      .translateExtent([[0, 0], [width, this.detailHeight]])
      .extent([[0, 0], [width, this.detailHeight]]);

    this.d3el.selectAll('.detail, .detail clipPath rect')
      .attr('width', width)
      .attr('height', this.detailHeight);

    this.drawHistogram(
      fullList,
      filteredList,
      this.detailX,
      this.detailY,
      this.d3el.select('.detail'),
      this.overviewY.domain()
    );
  }
  drawHistogram (fullList, filteredList, xScale, yScale, svg, yDomain = undefined) {
    const { dataset, key } = this.getTimestampMode();
    const mapFunc = transition => {
      return transition[dataset] && new Date(transition[dataset][key]);
    };

    const histogramGenerator = d3.histogram()
      .domain(xScale.domain())
      .thresholds(xScale.ticks());
    const fullData = histogramGenerator(fullList.map(mapFunc).filter(d => !isNaN(d)));
    const filteredData = histogramGenerator(filteredList.map(mapFunc).filter(d => !isNaN(d)));

    if (yDomain) {
      yScale.domain(yDomain);
    } else {
      yScale.domain(d3.extent(fullData, d => d.length));
    }

    svg.select('.x.axis')
      .call(d3.axisBottom(xScale));
    svg.select('.y.axis')
      .call(d3.axisLeft(yScale));

    this.drawBins(fullData, xScale, yScale, svg.select('.fullBins'));
    this.drawBins(filteredData, xScale, yScale, svg.select('.filteredBins'));
  }
  drawBins (data, xScale, yScale, container) {
    let bins = container.selectAll('.bin').data(data);
    bins.exit().remove();
    const binsEnter = bins.enter().append('rect')
      .classed('bin', true);
    bins = bins.merge(binsEnter);

    bins.attr('x', d => xScale(d.x0) + 1)
      .attr('width', d => Math.max(0, xScale(d.x1) - xScale(d.x0) - 1))
      .attr('y', d => yScale(d.length))
      .attr('height', d => yScale(0) - yScale(d.length));
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
    this.defaultHeatmapMargins = {
      top: 4 * this.emSize,
      right: 0.5 * this.emSize,
      bottom: 0,
      left: 6 * this.emSize
    };

    // Ensure that the y label is initially vertical, so that the first call
    // to getBoundingClientRect() correctly determines its height
    this.d3el.select('.heatmap .y.label')
      .attr('transform', 'rotate(-90)');

    // Labels of row and columns
    this.datasetTypes = ['tabular', 'network', 'spatial', 'grouped', 'textual', 'media'];

    // Build X scales:
    this.heatMapX = d3.scaleBand()
      .domain(this.datasetTypes)
      .padding(0.01);

    // Build X scales:
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
      top: this.defaultHeatmapMargins.top + yOffset,
      right: this.defaultHeatmapMargins.right,
      bottom: this.defaultHeatmapMargins.bottom,
      left: this.defaultHeatmapMargins.left + xOffset
    };

    const svg = this.d3el.select('.heatmap')
      .attr('width', width)
      .attr('height', height);
    svg.selectAll('.container, .x.axis, .y.axis')
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
