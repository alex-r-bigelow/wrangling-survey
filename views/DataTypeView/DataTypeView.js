import SurveyView from '../SurveyView/SurveyView.js';

class DataTypeView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DataTypeView/style.less' },
      { type: 'text', url: 'views/DataTypeView/template.html' }
    ]);
    this.humanLabel = 'Initial Data Abstraction';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setupLikertFields();
    super.collectKeyElements();
  }
  draw () {}
  isEnabled (formValues) {
    return true;
  }
  validateForm (formValues) {
    const invalidIds = this.requireFields(formValues, [
      'tabularThinking',
      'networkThinking',
      'spatialThinking',
      'groupedThinking',
      'textualThinking',
      'mediaThinking',
      'tabularRawData',
      'networkRawData',
      'spatialRawData',
      'groupedRawData',
      'textualRawData',
      'mediaRawData'
    ]);
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default DataTypeView;
