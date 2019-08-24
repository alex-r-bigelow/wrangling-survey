import SurveyView from '../SurveyView/SurveyView.js';

class ForcedTransformationView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/ForcedTransformationView/style.less' },
      { type: 'text', url: 'views/ForcedTransformationView/template.html' }
    ]);
    this.humanLabel = 'Transformation';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.collectKeyElements();
  }
  draw () {}
  isEnabled (formValues) {
    return formValues.datasetType !== 'N/A';
  }
}
export default ForcedTransformationView;
