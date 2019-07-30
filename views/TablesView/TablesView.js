import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class TablesView extends IntrospectableMixin(View) {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/TablesView/style.less' },
      { type: 'text', url: 'views/TablesView/template.html' }
    ]);
    this.transform = transform;
  }
  setup () {
    const state = this.transform ? 'post' : 'init'; // eslint-disable-line no-unused-vars
    this.d3el.html(eval('`' + this.resources[1] + '`')); // eslint-disable-line no-eval
  }
  draw () {}
}
export default TablesView;
