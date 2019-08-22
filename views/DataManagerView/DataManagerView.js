import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class DataManagerView extends IntrospectableMixin(View) {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/DataManagerView/style.less' },
      { type: 'text', url: 'views/DataManagerView/template.html' }
    ]);
  }
  setup () {
    this.d3el.html(this.resources[1]);
  }
  draw () {}
}
export default DataManagerView;
