import SurveyView from '../SurveyView/SurveyView.js';

class ConsentView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/ConsentView/style.less' },
      { type: 'text', url: 'views/ConsentView/template.html' }
    ]);
    this.humanLabel = 'Consent for Participation, Data Collection';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    this.d3el.select('.agree').on('click', () => {
      window.responses.resetCookie();
      window.controller.advanceSurvey('domain');
    });
  }
  draw () {}
  getNextView () {
    // this view has an .agree button instead of a .next one
  }
  populateForm (formValues) {
    // nothing to populate
  }
  isEnabled (formValues) {
    return true;
  }
  validateForm (formValues) {
    return {
      enabled: true,
      valid: !!formValues.cookie
    };
  }
}
export default ConsentView;
