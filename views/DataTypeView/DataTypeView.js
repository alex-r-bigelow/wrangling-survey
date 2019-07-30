import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class DataTypeView extends IntrospectableMixin(View) {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DataTypeView/style.less' },
      { type: 'text', url: 'views/DataTypeView/template.html' }
    ]);
  }
  setup () {
    this.d3el.html(this.resources[1]);
  }
  draw () {}
}
export default DataTypeView;
