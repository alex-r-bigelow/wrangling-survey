import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class DataTypeView extends IntrospectableMixin(View) {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DataTypeView/style.less' },
      { type: 'text', url: 'views/DataTypeView/template.html' }
    ]);
    this.enabled = true;
    this.humanLabel = 'Initial Data Abstraction';
  }
  setup () {
    this.d3el.html(this.resources[1]);

    this.d3el.selectAll('[data-key="datasetType"]')
      .on('click', function () {
        window.responses.setDataTypeOptions({
          datasetType: this.dataset.value
        });
      });
    function updateOtherOptions () {
      const options = {};
      options[this.dataset.key] = this.dataset.value || this.value;
      window.responses.setDataTypeOptions(options);
    }
    this.d3el.selectAll('[data-key]')
      .on('change', updateOtherOptions);
    this.d3el.select('textarea')
      .on('keyup', updateOtherOptions);
    this.d3el.select('.finish.button')
      .on('click', () => {
        if (window.responses.currentExploration &&
            window.responses.currentExploration.datasetType === 'N/A' &&
            window.responses.currentExploration.noTypeExplanation) {
          throw new Error('todo: unimplemented');
        }
      });
    this.d3el.select('.next.button')
      .on('click', () => {
        if (window.responses.currentExploration &&
            window.responses.currentExploration.datasetType !== 'N/A') {
          window.controller.advanceSurvey(window.responses.currentExploration.datasetType + '(init)');
        }
      });
  }
  draw () {
    if (!window.responses.currentExploration) {
      return;
    }
    this.d3el.selectAll('.button[data-key="datasetType"]')
      .classed('selected', function () {
        return (window.responses.currentExploration.datasetType === this.dataset.value);
      });
    const typeIsNa = window.responses.currentExploration.datasetType === 'N/A';
    this.d3el.select('.hybrid.field')
      .style('display', typeIsNa ? 'none' : null);
    this.d3el.select('[data-key="datasetIsHybrid"]')
      .property('checked', window.responses.currentExploration.datasetIsHybrid);
    this.d3el.select('.na.field')
      .style('display', typeIsNa ? null : 'none');
    this.d3el.select('.finish.button')
      .style('display', typeIsNa ? null : 'none')
      .classed('disabled', !typeIsNa || !window.responses.currentExploration.noTypeExplanation);
    this.d3el.select('.next.button')
      .style('display', typeIsNa ? 'none' : null)
      .classed('disabled', typeIsNa || !window.responses.currentExploration.datasetType);
  }
  validateForm (formResponses) {
    if (formResponses.datasetType === 'N/A') {
      delete formResponses.datasetIsHybrid;
    } else {
      delete formResponses.noTypeExplanation;
    }
  }
}
export default DataTypeView;
