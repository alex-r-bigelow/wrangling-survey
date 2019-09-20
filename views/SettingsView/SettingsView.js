import SurveyView from '../SurveyView/SurveyView.js';

class SettingsView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/SettingsView/style.less' },
      { type: 'text', url: 'views/SettingsView/template.html' }
    ]);
    this.humanLabel = 'Contact Settings';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.collectKeyElements();
  }
  draw () {

  }
  isEnabled () {
    return true;
  }
  validateForm (formValues) {
    const invalidIds = {};
    if (!formValues['email'] || formValues['email'].indexOf('@') === -1) {
      invalidIds['email'] = true;
    }
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default SettingsView;
