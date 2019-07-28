import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class FieldView extends IntrospectableMixin(View) {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/FieldView/style.less' },
      { type: 'text', url: 'views/FieldView/template.html' }
    ]);
    this.transform = transform;
  }
  setup () {
    this.d3el.html(this.resources[1]);
  }
  draw () {}
}
export default FieldView;
