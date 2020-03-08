import SurveyView from '../SurveyView/SurveyView.js';

class SettingsView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/SettingsView/style.less' },
      { type: 'text', url: 'views/SettingsView/template.html' }
    ]);
    this.humanLabel = 'Contact Settings';
    const pendingRepsonseStrings = window.localStorage.getItem('pendingResponseStrings');
    this.stall = pendingRepsonseStrings === null || !JSON.parse(pendingRepsonseStrings)['DR.UID'];
  }
  setup () {
    super.setup();
    this.d3el.html(this.resources[1]);
    if (!window.controller.unfinishedResponse && window.controller.database.context) {
      this.d3el.select('#context').node().value = window.controller.database.context;
    }
    this.collectKeyElements();
  }
  isVisible () {
    return true;
  }
  validateForm (formValues) {
    const invalidIds = {};
    const pendingResponses = window.controller.database.getPendingResponses();
    if ((!formValues['email'] || formValues['email'].indexOf('@') === -1) &&
        pendingResponses.length === 0) {
      invalidIds['email'] = true;
    }
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default SettingsView;
