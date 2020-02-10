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
  }
}
class DebriefResponseEtsView extends DebriefResponseDasView {
  constructor (div) {
    super(div);
    this.humanLabel = 'Alternative Dataset Debrief';
    this.responseType = 'etsResponse';
  }
}
export { DebriefResponseDasView, DebriefResponseEtsView };
