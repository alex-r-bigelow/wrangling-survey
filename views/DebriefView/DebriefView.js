import SurveyView from '../SurveyView/SurveyView.js';

class DebriefView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DebriefView/style.less' },
      { type: 'text', url: 'views/DebriefView/template.html' }
    ]);
    this.humanLabel = 'Debrief';
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
export default DebriefView;
