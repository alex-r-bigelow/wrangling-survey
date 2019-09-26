import SurveyView from '../SurveyView/SurveyView.js';

class DashboardView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DashboardView/style.less' },
      { type: 'text', url: 'views/DashboardView/template.html' }
    ]);
    this.humanLabel = 'Your Responses';
  }
  setup () {
    this.d3el.html(this.resources[1]);

    this.d3el.select('.DAS.button').on('click', () => {
      window.location.replace('/DAS.html');
    });
  }
  draw () {

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
export default DashboardView;
