import VisView from '../VisView/VisView.js';

class OverView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/OverView/style.less' },
      { type: 'text', url: 'views/OverView/template.html' }
    ]);
    this.humanLabel = 'Overview';
  }
  setup () {
    this.d3el.html(this.resources[1]);
  }
  draw () {
    super.draw();

    const filteredTransitionList = window.controller.getFilteredTransitionList();

    if (filteredTransitionList !== null) {
      this.drawYourResponses(filteredTransitionList);
    }
  }
  drawYourResponses (transitionList) {
    const datasets = {};
    for (const { dasResponse, etsResponse } of transitionList) {
      if (dasResponse.browserId === window.controller.database.browserId) {
        const datasetId = dasResponse.datasetLabel + dasResponse.submitTimestamp;
        datasets[datasetId] = datasets[datasetId] || {
          label: dasResponse.datasetLabel,
          pending: !!dasResponse.pending
        };
        datasets[datasetId][etsResponse.targetType] = datasets[datasetId][etsResponse.targetType] || 0;
        datasets[datasetId][etsResponse.targetType] += 1;
      }
    }
    const datasetList = Object.values(datasets);

    if (datasetList.length > 0) {
      this.d3el.select('.yourResponseTable')
        .style('display', null);
      this.d3el.selectAll('.noResponses, .allFiltered')
        .style('display', 'none');
    } else {
      (async () => {
        this.d3el.select('.yourResponseTable')
          .style('display', 'none');
        const unfilteredOwnedCount = (await window.controller.database.getOwnedResponses('DR.DAS')).length;
        this.d3el.select('.noResponses')
          .style('display', unfilteredOwnedCount > 0 ? 'none' : null);
        this.d3el.select('.allFiltered')
          .style('display', unfilteredOwnedCount > 0 ? null : 'none');
      })();
    }

    let dasResponses = this.d3el.select('.yourResponseTable tbody')
      .selectAll('tr').data(datasetList, d => d.label);
    dasResponses.exit().remove();
    const dasResponsesEnter = dasResponses.enter().append('tr');
    dasResponses = dasResponses.merge(dasResponsesEnter);

    // Dataset label
    dasResponsesEnter.append('td').classed('datasetLabel', true);
    dasResponses.select('.datasetLabel').text(d => d.label);

    // Status
    dasResponsesEnter.append('td').classed('status', true).append('small');
    dasResponses.select('.status small').html(d => d.pending ? 'review<br/>pending' : 'submission<br/>accepted');

    // Tabular
    dasResponsesEnter.append('td').classed('tabular', true);
    dasResponses.select('.tabular').text(d => d.tabular || 0);

    // Network / Hierarchy
    dasResponsesEnter.append('td').classed('network', true);
    dasResponses.select('.network').text(d => d.network || 0);

    // Spatial / Temporal
    dasResponsesEnter.append('td').classed('spatial', true);
    dasResponses.select('.spatial').text(d => d.spatial || 0);

    // Grouped
    dasResponsesEnter.append('td').classed('grouped', true);
    dasResponses.select('.grouped').text(d => d.grouped || 0);

    // Textual
    dasResponsesEnter.append('td').classed('textual', true);
    dasResponses.select('.textual').text(d => d.textual || 0);

    // Media
    dasResponsesEnter.append('td').classed('media', true);
    dasResponses.select('.media').text(d => d.media || 0);
  }
  isVisible () {
    return true;
  }
}
export default OverView;
