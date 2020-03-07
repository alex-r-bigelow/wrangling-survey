import VisView from '../VisView/VisView.js';

class DebriefResponseView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DebriefView/style.less' },
      { type: 'text', url: 'views/DebriefView/template.html' }
    ]);
    this.humanLabel = 'Initial Dataset Debrief';
    this.responseType = 'dasResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
    this.d3el.select('.submit.button')
      .classed('submit', false)
      .classed('next', true)
      .select('.label')
      .text('Next');
  }
}
export default DebriefResponseView;
