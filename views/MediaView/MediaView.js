import SurveyView from '../SurveyView/SurveyView.js';

class MediaView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/MediaView/style.less' },
      { type: 'text', url: 'views/MediaView/template.html' }
    ]);
    this.humanLabel = '<span class="inspectable">Media</span> Data Details';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setupLikertFields();
    super.collectKeyElements();
  }
  isEnabled (formValues) {
    return (formValues.mediaThinking && formValues.mediaThinking !== 'Never') ||
      (window.controller.params && window.controller.params.targetType === 'media');
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
export default MediaView;
