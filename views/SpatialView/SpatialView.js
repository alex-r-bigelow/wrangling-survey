import SurveyView from '../SurveyView/SurveyView.js';

class SpatialView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/SpatialView/style.less' },
      { type: 'text', url: 'views/SpatialView/template.html' }
    ]);
    this.humanLabel = '<span class="inspectable">Spatial</span> / <span class="inspectable">Temporal</span> Data Details';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setupLikertFields();
    super.collectKeyElements();
  }
  isEnabled (formValues) {
    return (formValues.spatialThinking && formValues.spatialThinking !== 'Never') ||
      (window.controller.params && window.controller.params.targetType === 'spatial');
  }
  validateForm (formValues) {
    const invalidIds = super.requireFields(formValues, [
      'nDimensions'
    ]);
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default SpatialView;
