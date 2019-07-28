import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class NetworkView extends IntrospectableMixin(View) {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/NetworkView/style.less' },
      { type: 'text', url: 'views/NetworkView/template.html' }
    ]);
    this.transform = transform;
  }
  setup () {
    this.d3el.html(this.resources[1]);
  }
  draw () {}
}
export default NetworkView;
