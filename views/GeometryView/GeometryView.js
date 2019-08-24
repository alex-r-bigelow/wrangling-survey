import SurveyView from '../SurveyView/SurveyView.js';

class GeometryView extends SurveyView {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/GeometryView/style.less' },
      { type: 'text', url: 'views/GeometryView/template.html' }
    ]);
    this.state = transform ? 'post' : 'init';
    this.humanLabel = 'Geometry Details';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.collectKeyElements();
  }
  draw () {}
  isEnabled (formValues) {
    return this.state === 'init' && formValues.datasetType === 'Geometry';
  }
}
export default GeometryView;
