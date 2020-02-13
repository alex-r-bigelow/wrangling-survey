import VisView from '../VisView/VisView.js';

class DebriefResponseDasView extends VisView {
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
class DebriefResponseEtsView extends DebriefResponseDasView {
  constructor (div) {
    super(div);
    this.humanLabel = 'Alternative Dataset Debrief';
    this.responseType = 'etsResponse';
  }
  setup () {
    super.setup();
    this.d3el.selectAll('.thanks').remove();
    this.d3el.select('.buttonContainer').remove();
  }
  filterTransition (transition) {
    return transition.etsResponse !== null;
  }
}
export { DebriefResponseDasView, DebriefResponseEtsView };
