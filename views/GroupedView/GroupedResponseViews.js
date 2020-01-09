import VisView from '../VisView/VisView.js';

class GroupedResponseDasView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/GroupedView/style.less' },
      { type: 'text', url: 'views/GroupedView/template.html' }
    ]);
    this.humanLabel = 'Initial Grouped Data Details';
    this.responseType = 'dasResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
  }
  filterTransition (transition) {
    return transition.dasResponse.groupedThinking !== 'Never';
  }
}

class GroupedResponseEtsView extends GroupedResponseDasView {
  constructor (div) {
    super(div);
    this.humanLabel = 'Alternative Grouped Data Details';
    this.responseType = 'etsResponse';
  }
  filterTransition (transition) {
    return transition.etsResponse.targetType === 'grouped';
  }
}
export { GroupedResponseDasView, GroupedResponseEtsView };
