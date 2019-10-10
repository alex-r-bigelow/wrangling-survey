import SurveyView from '../SurveyView/SurveyView.js';

class GroupedView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/GroupedView/style.less' },
      { type: 'text', url: 'views/GroupedView/template.html' }
    ]);
    this.humanLabel = '<span class="inspectable">Grouped</span> Data Details';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setupLikertFields();
    super.collectKeyElements();
  }
  isEnabled (formValues) {
    return (formValues.groupedThinking && formValues.groupedThinking !== 'Never') ||
      (window.controller.params && window.controller.params.targetType === 'grouped');
  }
  validateForm (formValues) {
    const invalidIds = {};
    // TODO
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default GroupedView;
