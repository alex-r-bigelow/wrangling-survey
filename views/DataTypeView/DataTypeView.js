import SurveyView from '../SurveyView/SurveyView.js';

class DataTypeView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DataTypeView/style.less' },
      { type: 'text', url: 'views/DataTypeView/template.html' }
    ]);
    this.humanLabel = 'Initial Data Abstraction';
    this._datasetTypes = {};
    if (window.DEBUG_SURVEY_VIEW_INDEX === 2) {
      this.datasetTypes['Tabular'] = true;
    }
    if (window.DEBUG_SURVEY_VIEW_INDEX === 3) {
      this.datasetTypes['Network'] = true;
    }
    if (window.DEBUG_SURVEY_VIEW_INDEX === 4) {
      this.datasetTypes['Spatial'] = true;
    }
    if (window.DEBUG_SURVEY_VIEW_INDEX === 5) {
      this.datasetTypes['Textual'] = true;
    }
  }
  setup () {
    const self = this;
    this.d3el.html(this.resources[1]);
    this.d3el.selectAll('[data-key="datasetType"]')
      .on('click', function () {
        self._datasetTypes[this.dataset.value] = !self._datasetTypes[this.dataset.value];
        self.trigger('formValuesChanged');
      });
    super.collectKeyElements();
  }
  draw () {
    const self = this;
    this.d3el.selectAll('.button[data-key="datasetType"]')
      .classed('selected', function () {
        return self._datasetTypes[this.dataset.value];
      });
    const typeIsOther = this._datasetTypes['Other'];
    this.d3el.select('.hybrid.field')
      .style('display', typeIsOther ? 'none' : null);
    this.d3el.select('.other.field')
      .style('display', typeIsOther ? null : 'none');
  }
  populateForm (formValues) {
    this._datasetTypes = formValues.datasetTypes;
    super.populateForm(formValues);
    this.render();
  }
  isEnabled (formValues) {
    return true;
  }
  validateForm (formValues) {
    formValues.datasetTypes = this._datasetTypes;
    let valid = Object.values(formValues.datasetTypes).some(d => !!d);
    const invalidIds = {};
    if (formValues.datasetTypes.Other) {
      valid = !!formValues.otherTypeExplanation;
      if (!valid) {
        invalidIds['otherTypeExplanation'] = true;
      }
    } else {
      delete formValues.otherTypeExplanation;
    }
    return { valid, invalidIds };
  }
}
export default DataTypeView;
