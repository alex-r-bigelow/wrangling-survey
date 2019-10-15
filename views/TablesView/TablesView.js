import SurveyView from '../SurveyView/SurveyView.js';

class TablesView extends SurveyView {
  constructor (div, transform) {
    super(div, [
      { type: 'less', url: 'views/TablesView/style.less' },
      { type: 'text', url: 'views/TablesView/template.html' }
    ]);
    this.state = transform ? 'post' : 'init';
    this.humanLabel = '<span class="inspectable">Tabular</span> Data Details';
    this.dataTypeLabel = '<span class="inspectable">tabular</span>';
  }
  get nTables () {
    const checkedElement = this.d3el.selectAll(`[name="nTables"]`)
      .nodes().filter(element => element.checked)[0];
    return checkedElement && checkedElement.value;
  }
  get nestedStructures () {
    return this.d3el.select(`[data-flag="Nested cell structures"]`).node().checked;
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setupLikertFields();
    super.collectKeyElements();
  }
  draw () {
    this.d3el.select('.secondTable')
      .style('display', this.nTables === '1' ? 'none' : null);
    this.d3el.select(`.nested`)
      .style('display', this.nestedStructures ? null : 'none');
  }
  isEnabled (formValues) {
    return (formValues.tabularThinking && formValues.tabularThinking !== 'Never') ||
      (window.controller.params && window.controller.params.targetType === 'tabular');
  }
  validateForm (formValues) {
    const invalidIds = super.requireFields(formValues, [
      'nTables'
    ]);
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default TablesView;
