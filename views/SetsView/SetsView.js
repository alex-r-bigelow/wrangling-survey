import SurveyView from '../SurveyView/SurveyView.js';

class SetsView extends SurveyView {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/SetsView/style.less' },
      { type: 'text', url: 'views/SetsView/template.html' }
    ]);
    this.state = transform ? 'post' : 'init';
    this.humanLabel = 'Cluster / Set / List Details';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.collectKeyElements();
  }
  draw () {}
  isEnabled (formValues) {
    return this.state === 'init' && formValues.datasetType === 'Sets';
  }
}
export default SetsView;
