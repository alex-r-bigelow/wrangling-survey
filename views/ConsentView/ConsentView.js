import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class ConsentView extends IntrospectableMixin(View) {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/ConsentView/style.less' },
      { type: 'text', url: 'views/ConsentView/template.html' }
    ]);
  }
  setup () {
    this.d3el.html(this.resources[1]);
    this.d3el.select('.agree').on('click', () => {
      window.localStorage.setItem('consented', 'true');
      window.controller.renderAllViews();
    });
  }
  draw () {}
}
export default ConsentView;
