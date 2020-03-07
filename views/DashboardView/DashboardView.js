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
    super.setup();
    this.d3el.html(this.resources[1]);

    this.d3el.select('.idDisplay').text(window.controller.database.browserId);
    const plushieDirections = window.controller.database.contextIsConference
      ? 'While supplies last, show this screen to someone at the Arizona Research Computing booth'
      : window.controller.database.contextIsArizona
        ? 'Please contact <a mailto="alexrbigelow@email.arizona.edu">Alex Bigelow</a> to TODO' : null;
    this.d3el.select('.plushieInfo')
      .style('display', plushieDirections ? null : 'none')
      .select('.directions').html(plushieDirections);

    this.d3el.select('.DAS.button').on('click', () => {
      window.location.href = 'DAS.html';
    });
  }
  draw () {
    super.draw();
    const summary = window.controller.database.getUserResponseSummary();
    this.d3el.select('.yourResponseTable')
      .style('display', summary.datasetList.length > 0 ? null : 'none');

    const nTerms = Object.keys(summary.terminology).length +
      Object.keys(summary.alternateDefinitions).length;
    this.d3el.select('.terminologyCount')
      .text(`${nTerms} alternate term${nTerms === 1 ? '' : 's'} and definition${nTerms === 1 ? '' : 's'} suggested`);
    const nDatasets = summary.datasetList.length;
    this.d3el.select('.datasetsCount')
      .text(`${nDatasets} dataset${nDatasets === 1 ? '' : 's'} described`);
    const nExplorations = (summary.responses['DR.ETS'] || []).length;
    this.d3el.select('.alternateCount')
      .text(`${nExplorations} alternate perspective${nExplorations === 1 ? '' : 's'} explored`);

    let thankYou;
    if (nDatasets + nExplorations === 0) {
      thankYou = 'Please click "Describe a new dataset" to get started';
    } else if (nDatasets + nExplorations === 1) {
      thankYou = 'Almost there! Please click the "Explore alternative" button';
    } else {
      thankYou = 'Thank you for participating! Go pick up a plushie!';
    }
    this.d3el.select('.thankYou').text(thankYou);

    let dasResponses = this.d3el.select('.yourResponseTable tbody')
      .selectAll('tr').data(summary.datasetList);
    dasResponses.exit().remove();
    const dasResponsesEnter = dasResponses.enter().append('tr');
    dasResponses = dasResponses.merge(dasResponsesEnter);

    // Explore buttons
    const buttonEnter = dasResponsesEnter.append('td').classed('explore', true)
      .append('div').classed('button', true).classed('imgAndLabel', true);
    buttonEnter.append('a')
      .append('img').attr('src', 'img/exploration.svg');
    buttonEnter.append('span').classed('label', true).text('Explore alternative');
    dasResponses.select('.explore .button').on('click', d => {
      const params = new URLSearchParams(Object.assign({}, d.nextAlternates[0], {
        datasetLabel: d.datasetLabel,
        datasetSubmitTimestamp: d.submitTimestamp
      }));
      window.location.href = `ETS?${params.toString()}`;
    });
    dasResponses.select('.explore .button')
      .attr('id', (d, i) => i === 0 ? 'firstExploreButton' : null);

    // Dataset label
    dasResponsesEnter.append('td').classed('datasetLabel', true);
    dasResponses.select('.datasetLabel').text(d => d.datasetLabel);

    // Status
    dasResponsesEnter.append('td').classed('status', true).append('small');
    dasResponses.select('.status small').html(d => d.pending ? 'review<br/>pending' : 'submission<br/>accepted');

    // Tabular
    dasResponsesEnter.append('td').classed('tabular', true);
    dasResponses.select('.tabular').text(d => d.alternateExplorations.tabular.length);

    // Network / Hierarchy
    dasResponsesEnter.append('td').classed('network', true);
    dasResponses.select('.network').text(d => d.alternateExplorations.network.length);

    // Spatial / Temporal
    dasResponsesEnter.append('td').classed('spatial', true);
    dasResponses.select('.spatial').text(d => d.alternateExplorations.spatial.length);

    // Grouped
    dasResponsesEnter.append('td').classed('grouped', true);
    dasResponses.select('.grouped').text(d => d.alternateExplorations.grouped.length);

    // Textual
    dasResponsesEnter.append('td').classed('textual', true);
    dasResponses.select('.textual').text(d => d.alternateExplorations.textual.length);

    // Media
    dasResponsesEnter.append('td').classed('media', true);
    dasResponses.select('.media').text(d => d.alternateExplorations.media.length);
  }
  isVisible () {
    return true;
  }
  validateForm (formValues) {
    const summary = window.controller.database.getUserResponseSummary();
    const invalidIds = {};
    // These conditions are redundant, but should make it easy to change requirements
    if (!summary.responses['DR.DAS'] || summary.responses['DR.DAS'].length < 1) {
      invalidIds['describeNewButton'] = true;
    }
    if (!summary.responses['DR.ETS'] || summary.responses['DR.ETS'].length < 1) {
      invalidIds['firstExploreButton'] = true;
    }
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default DashboardView;
