import SurveyView from '../SurveyView/SurveyView.js';

class TextView extends SurveyView {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/TextView/style.less' },
      { type: 'text', url: 'views/TextView/template.html' }
    ]);
    this.state = transform ? 'post' : 'init';
    this.humanLabel = 'Textual Data Details';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.collectKeyElements();
  }
  draw () {}
  isEnabled (formValues) {
    return this.state === 'init' && formValues.datasetType === 'Textual';
  }
}
export default TextView;
