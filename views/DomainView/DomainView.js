import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class DomainView extends IntrospectableMixin(View) {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DomainView/style.less' },
      { type: 'text', url: 'views/DomainView/template.html' }
    ]);
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
  getDomainOptions () {
    const options = {};
    this.d3el.selectAll('[data-key]').each(function () {
      if (this.dataset.flag) {
        options[this.dataset.key] = options[this.dataset.key] || [];
        if (this.checked) {
          options[this.dataset.key].push(this.dataset.flag);
        }
      } else {
        options[this.dataset.key] = this.value;
      }
    });
    return options;
  }
  setup () {
    this.d3el.html(this.resources[1]);

    this.d3el.select('#existingLabels')
      .selectAll('option')
      .data(this.exampleDatasets, d => d)
      .enter().append('option')
      .attr('value', d => d);

    this.d3el.selectAll('[data-key]')
      .on('change', () => {
        window.responses.setDomainOptions(this.getDomainOptions());
      });

    this.d3el.select('.next').on('click', () => {
      if (window.responses.currentDataset) {
        window.controller.advanceSurvey('dataType');
      }
    });
  }
  draw () {
    if (window.responses.currentDataset) {
      for (const [key, value] of Object.entries(window.responses.currentDataset)) {
        if (value instanceof Array) {
          this.d3el.selectAll(`[data-key="${key}"]`)
            .property('checked', function () {
              return value.indexOf(this.dataset.flag) !== -1;
            });
        } else {
          this.d3el.select(`[data-key="${key}"]`)
            .property('value', value);
        }
      }
    }
    this.d3el.select('.next.button').classed('disabled', !window.responses.currentDataset);
  }
}
export default DomainView;
