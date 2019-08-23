import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class DomainView extends IntrospectableMixin(View) {
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

    this.d3el.select('.next').on('click', () => {
      if (this.datasetLabel) {
        window.controller.advanceSurvey('dataType');
      }
    });
  }
  draw () {
    this.d3el.select('.next.button').classed('disabled', !this.datasetLabel);
  }
  validateForm (formValues) {
    const invalidKeys = {};
    const valid = !!this.datasetLabel;
    if (!valid) {
      invalidKeys['datasetLabel'] = true;
    }
    return { enabled: true, valid, invalidKeys };
  }
}
export default DomainView;
