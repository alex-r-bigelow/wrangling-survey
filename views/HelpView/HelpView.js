/* globals d3 */
import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class HelpView extends IntrospectableMixin(View) {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/HelpView/style.less' },
      { type: 'html', url: 'views/HelpView/definitions.html' }
    ]);
  }
  setup () {
    const self = this;
    this.definitions = {};
    d3.select(this.resources[1])
      .selectAll('[data-inspectable]')
      .each(function () {
        self.definitions[this.dataset.inspectable] = this;
      });
    d3.selectAll('.inspectable')
      .on('mouseenter', function () {
        const helpElement = self.definitions[this.innerText];
        self.d3el.html((helpElement && helpElement.outerHTML) || '');
      })
      .on('mouseleave', () => {
        self.d3el.html('');
      })
      .each(function () {
        if (!self.definitions[this.innerText]) {
          console.warn(`No help definition for concept: ${this.innerText}`);
        }
      });
  }
  draw () {}
}
export default HelpView;
