import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class TablesView extends IntrospectableMixin(View) {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/TablesView/style.less' },
      { type: 'text', url: 'views/TablesView/template.html' }
    ]);
    this.state = transform ? 'post' : 'init';
    this.humanLabel = 'Table Details';
  }
  get nTables () {
    return this.d3el.selectAll(`[data-key="${this.state}NTables"]`)
      .nodes().filter(element => element.checked)[0].dataset.checkedValue;
  }
  get nestedStructures () {
    return this.d3el.select(`[data-flag="Nested cell structures"]`).node().checked;
  }
  setup () {
    const state = this.state; // eslint-disable-line no-unused-vars
    this.d3el.html(eval('`' + this.resources[1] + '`')); // eslint-disable-line no-eval
  }
  draw () {
    this.d3el.select('.secondTable')
      .style('display', this.nTables === '1' ? 'none' : null);
    this.d3el.select(`.nested`)
      .style('display', this.nestedStructures ? null : 'none');
  }
  validateForm (formValues) {
    const enabled = this.state === 'init' && formValues.datasetType === 'Tables';
    if (!enabled) {
      return { enabled, valid: false };
    }

    let emptyCells = {};
    const initExampleData = formValues[`${this.state}ExampleData`];
    if (initExampleData) {
      const nTables = formValues[`${this.state}NTables`];
      for (const [key, value] of Object.entries(initExampleData)) {
        const [table, row, col] = key.match(/table([^_]*)_([^_]*)_([^_]*)/).slice(1, 4);
        if (table === '2' && nTables === '1') {
          // Clear out the unused table
          initExampleData[key] = '';
        } else if (!value && (row === 'H' || col === 'H')) {
          // Use the placeholder values if the user didn't provide them for the headers
          initExampleData[key] = this.d3el.select(`[data-role="${key}"]`).property('placeholder');
        } else if (!value) {
          // Note that there are empty cells
          emptyCells[this.state + key] = true;
        }
      }
    }

    const nuanceFlags = formValues[`${this.state}TableNuances`];
    if (!nuanceFlags || nuanceFlags.indexOf('Nested cell structures') === -1) {
      delete formValues[`${this.state}TableNestedExample`];
    }
    let invalidIds = {};
    if (nuanceFlags && Object.keys(emptyCells).length > 0 && nuanceFlags.indexOf('Empty cells') === -1) {
      invalidIds[`${this.state}EmptyCells`] = true;
      Object.assign(invalidIds, emptyCells);
    }

    return {
      enabled,
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default TablesView;
