import SurveyView from '../SurveyView/SurveyView.js';

class GroupedView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/GroupedView/style.less' },
      { type: 'text', url: 'views/GroupedView/template.html' }
    ]);
    this.humanLabel = '<span class="inspectable">Grouped</span> Data Details';
    this.dataTypeLabel = '<span class="inspectable">grouped</span>';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    this.setupProtest();
    this.setupLikertFields();
    this.collectKeyElements();
  }
  isEnabled (formValues) {
    return (formValues.groupedThinking && formValues.groupedThinking !== 'Never') ||
      (window.controller.params && window.controller.params.targetType === 'grouped');
  }
  validateForm (formValues) {
    const invalidIds = super.requireFields(formValues, [
      'numGroups'
    ]);
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default GroupedView;
