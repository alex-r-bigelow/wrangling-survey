import VisView from '../VisView/VisView.js';

class GroupedResponseDasView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/GroupedView/style.less' },
      { type: 'text', url: 'views/GroupedView/template.html' }
    ]);
    this.humanLabel = 'Grouped Data Details';
    this.responseType = 'dasResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
  }
  isVisible () {
    return true;
  }
}

class GroupedResponseEtsView extends GroupedResponseDasView {
  constructor (div) {
    super(div);
    this.responseType = 'etsResponse';
  }
}
export { GroupedResponseDasView, GroupedResponseEtsView };
