/* globals d3 */
import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class TablesView extends IntrospectableMixin(View) {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/TablesView/style.less' },
      { type: 'text', url: 'views/TablesView/template.html' }
    ]);
    this.state = transform ? 'post' : 'init';
  }
  setup () {
    const state = this.state; // eslint-disable-line no-unused-vars
    this.d3el.html(eval('`' + this.resources[1] + '`')); // eslint-disable-line no-eval

    this.nTables = 1;
    this.d3el.selectAll(`[data-key="${this.state}NTables"]`)
      .on('change', () => {
        this.nTables = d3.event.target.value;
        this.render();
      });

    this.nestedStructures = false;
    this.d3el.select(`#${this.state}NestedCellStructures`)
      .on('change', () => {
        this.nestedStructures = d3.event.target.checked;
        this.render();
      });
  }
  draw () {
    this.d3el.select(`.nested`)
      .style('display', this.nestedStructures ? null : 'none');
  }
  validateForm (formResponses) {
    const nuanceFlags = formResponses[`${this.state}TableNuances`];
    if (!nuanceFlags || nuanceFlags.indexOf('Nested cell structures') === -1) {
      delete formResponses[`${this.state}TableNestedExample`];
    }
  }
}
export default TablesView;
