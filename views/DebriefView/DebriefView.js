import SurveyView from '../SurveyView/SurveyView.js';

class DebriefView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DebriefView/style.less' },
      { type: 'text', url: 'views/DebriefView/template.html' }
    ]);
    this.humanLabel = 'Debrief';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setupLikertFields();
    super.collectKeyElements();
  }
  draw () {}
  isEnabled () {
    return true;
  }
  validateForm (formValues) {
    const invalidIds = super.requireFields(formValues, [
      'numItems',
      'numAttributes',
      'datasetSize'
    ]);
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default DebriefView;
