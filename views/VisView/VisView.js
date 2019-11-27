/* globals d3 */
import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class VisView extends IntrospectableMixin(View) {
  constructor (div, resourceList = []) {
    super(div, resourceList);
    this.keyElements = [];
    this.protesting = false;
    this.wrongWay = false;
    this.on('open', () => {
      let header = this.d3el.node();
      header = header && d3.select(header.parentNode).select('summary').node();
      if (header) {
        header.scrollIntoView();
      }
    });
  }
  get className () {
    return this.type;
  }
  collectKeyElements () {
    this.keyElements = this.d3el.selectAll('[data-key]').nodes();
  }
  setupLikertFields () {
    this.d3el.selectAll('[data-likert]').each(function () {
      // TODO
    });
  }
  setupProtest () {
    // TODO
  }
  draw () {
    // TODO
  }
  isVisible () {
    console.warn(`isVisible not implemented for ${this.type}`);
  }
}
export default VisView;
