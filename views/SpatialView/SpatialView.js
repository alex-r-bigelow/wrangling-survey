import SurveyView from '../SurveyView/SurveyView.js';

class SpatialView extends SurveyView {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/SpatialView/style.less' },
      { type: 'text', url: 'views/SpatialView/template.html' }
    ]);
    this.state = transform ? 'post' : 'init';
    this.humanLabel = 'Spatial / Temporal Data Details';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.collectKeyElements();
  }
  draw () {}
  isEnabled (formValues) {
    return this.state === 'init' && formValues.datasetType === 'Spatial';
  }
}
export default SpatialView;
