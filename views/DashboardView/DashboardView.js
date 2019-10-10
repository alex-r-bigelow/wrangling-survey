import SurveyView from '../SurveyView/SurveyView.js';

class DashboardView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DashboardView/style.less' },
      { type: 'text', url: 'views/DashboardView/template.html' }
    ]);
    this.humanLabel = 'Your Responses';
  }
  setup () {
    this.d3el.html(this.resources[1]);

    this.d3el.select('.idDisplay').text(window.controller.database.browserId);
    this.d3el.select('.conferenceOnly')
      .style('display', window.controller.database.contextIsConference ? null : 'none');

    this.d3el.select('.DAS.button').on('click', () => {
      window.location.href = 'DAS.html';
    });
  }
  draw () {
    const summary = window.controller.database.getUserResponseSummary();
    this.d3el.select('.datasetTable')
      .style('display', summary.datasetList.length > 0 ? null : 'none');

    const nTerms = Object.keys(summary.terminology).length;
    this.d3el.select('.terminologyCount')
      .text(`${nTerms} alternate term${nTerms === 1 ? '' : 's'} suggested`);
    const nDatasets = summary.datasetList.length;
    this.d3el.select('.datasetsCount')
      .text(`${nDatasets} dataset${nDatasets === 1 ? '' : 's'} described`);
    const nExplorations = (summary.responses['DR.ETS'] || []).length;
    this.d3el.select('.terminologyCount')
      .text(`${nExplorations} alternate perspective${nExplorations === 1 ? '' : 's'} explored`);

    let dasResponses = this.d3el.select('.datasetTable tbody')
      .selectAll('tr').data(summary.datasetList);
    dasResponses.exit().remove();
    const dasResponsesEnter = dasResponses.enter().append('tr');
    dasResponses = dasResponses.merge(dasResponsesEnter);

    // Dataset label
    dasResponsesEnter.append('td').classed('datasetLabel', true);
    dasResponses.select('.datasetLabel').text(d => d.datasetLabel);

    // Timestamp
    dasResponsesEnter.append('td').classed('date', true);
    dasResponses.select('.date').text(d => new Date(d.timestamp).toLocaleDateString());

    // Status
    dasResponsesEnter.append('td').classed('status', true).classed('bordered', true);
    dasResponses.select('.status').classed('pending', d => !!d.pending);

    // Tabular
    dasResponsesEnter.append('td').classed('tabular', true).classed('bordered', true);
    dasResponses.select('.tabular').text(d => d.alternateExplorations.tabular.length);

    // Network / Hierarchy
    dasResponsesEnter.append('td').classed('network', true).classed('bordered', true);
    dasResponses.select('.network').text(d => d.alternateExplorations.network.length);

    // Spatial / Temporal
    dasResponsesEnter.append('td').classed('spatial', true).classed('bordered', true);
    dasResponses.select('.spatial').text(d => d.alternateExplorations.spatial.length);

    // Textual
    dasResponsesEnter.append('td').classed('textual', true).classed('bordered', true);
    dasResponses.select('.textual').text(d => d.alternateExplorations.textual.length);

    // Media
    dasResponsesEnter.append('td').classed('media', true).classed('bordered', true);
    dasResponses.select('.media').text(d => d.alternateExplorations.media.length);

    // Explore buttons
    const buttonEnter = dasResponsesEnter.append('td').classed('explore', true)
      .append('div').classed('button', true);
    buttonEnter.append('a');
    buttonEnter.append('span').classed('label', true).text('Explore alternative');
    dasResponses.select('.explore .button').on('click', d => {
      const params = new URLSearchParams(Object.assign({}, d.nextAlternates[0], {
        datasetLabel: d.datasetLabel,
        timestamp: d.timestamp
      }));
      window.location.href = `ETS?${params.toString()}`;
    });
  }
  isEnabled () {
    return true;
  }
  validateForm (formValues) {
    return {
      valid: true,
      invalidIds: {}
    };
  }
}
export default DashboardView;
