import SurveyView from '../SurveyView/SurveyView.js';

class AlternateDebriefView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/AlternateDebriefView/style.less' },
      { type: 'text', url: 'views/AlternateDebriefView/template.html' }
    ]);
    this.humanLabel = 'Debrief';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    this.collectKeyElements();
  }
  isEnabled () {
    return true;
  }
  validateForm (formValues) {
    return {
      valid: true,
      invalidIds: {}
    };
  }
}
export default AlternateDebriefView;
