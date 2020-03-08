import VisView from '../VisView/VisView.js';

class ReflectionsResponseView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/ReflectionsView/style.less' },
      { type: 'text', url: 'views/ReflectionsView/template.html' }
    ]);
    this.humanLabel = 'Alternative Dataset Reflections';
    this.responseType = 'etsResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
    this.d3el.selectAll('.datasetLabel').text('(Participant\'s initial dataset label)');
    this.d3el.selectAll('.targetType').text('(Alternative abstraction type)');
  }
  filterTransition (transition) {
    return transition.etsResponse !== null;
  }
}
export default ReflectionsResponseView;
