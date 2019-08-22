import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class AdjacencyMatrixView extends IntrospectableMixin(View) {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/AdjacencyMatrixView/style.less' },
      { type: 'text', url: 'views/AdjacencyMatrixView/template.html' }
    ]);
  }
  setup () {
    this.d3el.html(this.resources[1]);
  }
  draw () {}
}
export default AdjacencyMatrixView;
