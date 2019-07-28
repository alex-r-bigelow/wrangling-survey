import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class GeometryView extends IntrospectableMixin(View) {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/GeometryView/style.less' },
      { type: 'text', url: 'views/GeometryView/template.html' }
    ]);
    this.transform = transform;
  }
  setup () {
    this.d3el.html(this.resources[1]);
  }
  draw () {}
}
export default GeometryView;
