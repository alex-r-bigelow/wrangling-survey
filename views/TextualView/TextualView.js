import SurveyView from '../SurveyView/SurveyView.js';

class TextualView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/TextualView/style.less' },
      { type: 'text', url: 'views/TextualView/template.html' }
    ]);
    this.humanLabel = '<span class="inspectable">Textual</span> Data Details';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setupLikertFields();
    super.collectKeyElements();
  }
  isEnabled (formValues) {
    return (formValues.textualThinking && formValues.textualThinking !== 'Never') ||
      (window.controller.params && window.controller.params.targetType === 'textual');
  }
  validateForm (formValues) {
    const invalidIds = super.requireFields(formValues, [
      'numDocuments',
      'grammarType'
    ]);
    // TODO
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default TextualView;
