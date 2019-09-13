import SurveyView from '../SurveyView/SurveyView.js';

class TablesView extends SurveyView {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/TablesView/style.less' },
      { type: 'text', url: 'views/TablesView/template.html' }
    ]);
    this.state = transform ? 'post' : 'init';
    this.humanLabel = 'Tabular Data Details';
  }
  get nTables () {
    const checkedElement = this.d3el.selectAll(`[data-key="${this.state}NTables"]`)
      .nodes().filter(element => element.checked)[0];
    return checkedElement && checkedElement.dataset.checkedValue;
  }
  get nestedStructures () {
    return this.d3el.select(`[data-flag="Nested cell structures"]`).node().checked;
  }
  setup () {
    const state = this.state; // eslint-disable-line no-unused-vars
    this.d3el.html(eval('`' + this.resources[1] + '`')); // eslint-disable-line no-eval
    super.collectKeyElements();
  }
  draw () {
    this.d3el.select('.secondTable')
      .style('display', this.nTables === '1' ? 'none' : null);
    this.d3el.select(`.nested`)
      .style('display', this.nestedStructures ? null : 'none');
  }
  isEnabled (formValues) {
    if (formValues.datasetTypes['Tabular']) {
      return this.state === 'init';
    } else {
      return this.state === 'post';
    }
  }
  validateForm (formValues) {
    const nTables = formValues[`${this.state}NTables`];
    let emptyCells = {};
    const initExampleData = formValues[`${this.state}ExampleData`];
    if (initExampleData) {
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
    if (nTables === undefined) {
      invalidIds[`${this.state}OneTable`] = invalidIds[`${this.state}TwoTables`] = invalidIds[`${this.state}ThreeTables`] = true;
    }
    if (nuanceFlags && Object.keys(emptyCells).length > 0 && nuanceFlags.indexOf('Empty cells') === -1) {
      invalidIds[`${this.state}EmptyCells`] = true;
      Object.assign(invalidIds, emptyCells);
    }

    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default TablesView;
