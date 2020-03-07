import SurveyView from '../SurveyView/SurveyView.js';

class MediaView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/MediaView/style.less' },
      { type: 'text', url: 'views/MediaView/template.html' }
    ]);
    this.humanLabel = '<span class="inspectable">Media</span> Data Details';
    this.dataTypeLabel = '<span class="inspectable">media</span>';
  }
  setup () {
    super.setup();
    this.d3el.html(this.resources[1]);
    this.setupProtest();
    this.setupLikertFields();
    this.collectKeyElements();
  }
  isVisible (formValues) {
    return (formValues.mediaThinking && formValues.mediaThinking !== 'Never') ||
      (window.controller.params && window.controller.params.targetType === 'media');
  }
  validateForm (formValues) {
    const invalidIds = super.requireFields(formValues, [
      'colorChannelCount'
    ]);
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default MediaView;
