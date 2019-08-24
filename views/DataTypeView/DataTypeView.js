import SurveyView from '../SurveyView/SurveyView.js';

class DataTypeView extends SurveyView {
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
    super.collectKeyElements();
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
      .style('display', typeIsNa ? 'none' : null);
  }
  getNextView () {
    return this._datasetType + '(init)';
  }
  populateForm (formValues) {
    this._datasetType = formValues.datasetType;
    this.d3el.select('[data-key="datasetIsHybrid"]')
      .property('checked', formValues['datasetIsHybrid'] === 'true');
  }
  isEnabled (formValues) {
    return true;
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
    return { valid, invalidIds };
  }
}
export default DataTypeView;
