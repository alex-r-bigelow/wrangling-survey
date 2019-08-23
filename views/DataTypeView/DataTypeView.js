import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class DataTypeView extends IntrospectableMixin(View) {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DataTypeView/style.less' },
      { type: 'text', url: 'views/DataTypeView/template.html' }
    ]);
    this.humanLabel = 'Initial Data Abstraction';
    const debugView = window.DEBUG_VIEW && window.DEBUG_VIEW.match(/(.*)\(init\)/)[1];
    this._datasetType = debugView || null;
  }
  setup () {
    const self = this;
    this.d3el.html(this.resources[1]);
    this.d3el.selectAll('[data-key="datasetType"]')
      .on('click', function () {
        self._datasetType = this.dataset.value;
        window.controller.updateViews();
      });
    this.d3el.select('.na.field textarea')
      .on('keyup', () => { this.render(); });
    this.d3el.select('.finish.button')
      .on('click', () => {
        window.responses.submitForm();
      });
    this.d3el.select('.next.button')
      .on('click', () => {
        if (this._datasetType !== null) {
          window.controller.advanceSurvey(this._datasetType + '(init)');
        }
      });
  }
  draw () {
    const self = this;
    this.d3el.selectAll('.button[data-key="datasetType"]')
      .classed('selected', function () {
        return (self._datasetType === this.dataset.value);
      });
    const typeIsNa = this._datasetType === 'N/A';
    this.d3el.select('.hybrid.field')
      .style('display', typeIsNa ? 'none' : null);
    this.d3el.select('.na.field')
      .style('display', typeIsNa ? null : 'none');
    this.d3el.select('.finish.button')
      .style('display', typeIsNa ? null : 'none')
      .classed('disabled', () => {
        return !typeIsNa || !this.d3el.select('.na.field textarea').node().value;
      });
    this.d3el.select('.next.button')
      .style('display', typeIsNa ? 'none' : null)
      .classed('disabled', typeIsNa || this._datasetType === null);
  }
  populateForm (formValues) {
    this._datasetType = formValues.datasetType;
    this.d3el.select('[data-key="datasetIsHybrid"]')
      .property('checked', formValues['datasetIsHybrid'] === 'true');
  }
  validateForm (formValues) {
    formValues.datasetType = this._datasetType;
    let valid = formValues.datasetType !== null;
    const invalidIds = {};
    if (formValues.datasetType === 'N/A') {
      delete formValues.datasetIsHybrid;
      valid = !!formValues.noTypeExplanation;
      if (!valid) {
        invalidIds['noTypeExplanation'] = true;
      }
    } else {
      delete formValues.noTypeExplanation;
    }
    return { enabled: true, valid, invalidIds };
  }
}
export default DataTypeView;
