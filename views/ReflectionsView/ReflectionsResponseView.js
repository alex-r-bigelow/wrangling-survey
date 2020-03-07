import VisView from '../VisView/VisView.js';

class ReflectionsResponseView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/ReflectionsView/style.less' },
      { type: 'text', url: 'views/ReflectionsView/template.html' }
    ]);
    this.humanLabel = 'Alternative Dataset Debrief';
    this.responseType = 'etsResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
    this.d3el.selectAll('.thanks').remove();
    this.d3el.select('.buttonContainer').remove();
  }
  filterTransition (transition) {
    return transition.etsResponse !== null;
  }
}
export default ReflectionsResponseView;
