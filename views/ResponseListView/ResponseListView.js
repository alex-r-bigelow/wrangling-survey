import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class ResponseListView extends IntrospectableMixin(View) {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/ResponseListView/style.less' },
      { type: 'text', url: 'views/ResponseListView/template.html' }
    ]);
  }
  setup () {
    this.d3el.html(this.resources[1]);
  }
  draw () {}
}
export default ResponseListView;
