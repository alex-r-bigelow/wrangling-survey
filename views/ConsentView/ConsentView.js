/* globals d3 */
import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class ConsentView extends IntrospectableMixin(View) {
  constructor () {
    super(d3.select('.MiniMapView'), [
      { type: 'less', url: 'views/ConsentView/style.less' },
      { type: 'text', url: 'views/ConsentView/template.html' }
    ]);
  }
  setup () {
    this.d3el.html(this.resources[1]);
  }
  draw () {}
}
export default ConsentView;
