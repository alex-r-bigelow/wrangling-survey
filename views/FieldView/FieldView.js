import SurveyView from '../SurveyView/SurveyView.js';

class FieldView extends SurveyView {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/FieldView/style.less' },
      { type: 'text', url: 'views/FieldView/template.html' }
    ]);
    this.state = transform ? 'post' : 'init';
    this.humanLabel = 'Field Details';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.collectKeyElements();
  }
  draw () {}
  isEnabled (formValues) {
    return this.state === 'init' && formValues.datasetType === 'Field';
  }
}
export default FieldView;
