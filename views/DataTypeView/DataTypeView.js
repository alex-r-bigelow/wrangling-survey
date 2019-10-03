import SurveyView from '../SurveyView/SurveyView.js';

class DataTypeView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DataTypeView/style.less' },
      { type: 'text', url: 'views/DataTypeView/template.html' }
    ]);
    this.humanLabel = 'Initial Data Abstraction';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setupLikertFields();
    super.collectKeyElements();
  }
  draw () {}
  isEnabled (formValues) {
    return true;
  }
  validateForm (formValues) {
    let valid = true;
    const invalidIds = {};
    return { valid, invalidIds };
  }
}
export default DataTypeView;
