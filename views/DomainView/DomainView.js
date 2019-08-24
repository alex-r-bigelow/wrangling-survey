import SurveyView from '../SurveyView/SurveyView.js';

class DomainView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DomainView/style.less' },
      { type: 'text', url: 'views/DomainView/template.html' }
    ]);
    this.humanLabel = 'Domain Characterization';
    // TODO: populate this based on prior responses
    this.exampleDatasets = [
      'Brain MRI',
      'HPC traces',
      'US Census',
      'Next-Generation Sequencing',
      'Fossil database',
      'IMDB',
      'Corpus of news articles'
    ];
  }
  get datasetLabel () {
    const labelElement = this.d3el.select('[data-key="datasetLabel"]').node();
    return labelElement && labelElement.value;
  }
  setup () {
    this.d3el.html(this.resources[1]);

    this.d3el.select('#existingLabels')
      .selectAll('option')
      .data(this.exampleDatasets, d => d)
      .enter().append('option')
      .attr('value', d => d);
    super.collectKeyElements();
  }
  draw () {
    this.d3el.select('.next.button').classed('disabled', !this.datasetLabel);
  }
  getNextView () {
    return 'dataType';
  }
  isEnabled (formValues) {
    return true;
  }
  validateForm (formValues) {
    const invalidIds = {};
    const valid = !!formValues.datasetLabel;
    if (!valid) {
      invalidIds['datasetLabel'] = true;
    }
    return { valid, invalidIds };
  }
}
export default DomainView;
