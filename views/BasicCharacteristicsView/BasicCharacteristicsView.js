import SurveyView from '../SurveyView/SurveyView.js';

class BasicCharacteristicsView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/BasicCharacteristicsView/style.less' },
      { type: 'text', url: 'views/BasicCharacteristicsView/template.html' }
    ]);
    this.humanLabel = 'Basic Dataset Characteristics';
  }
  setup () {
    this.d3el.html(this.resources[1]);

    this.d3el.select('.designStudyReviewOnly')
      .style('display', window.controller.database.contextIsDesignStudyReview ? null : 'none');
    super.setupLikertFields();
    super.collectKeyElements();
  }
  isEnabled (formValues) {
    return true;
  }
  validateForm (formValues) {
    const invalidIds = super.requireFields(formValues, [
      'datasetSize',
      'numItems',
      'numAttributes'
    ]);
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default BasicCharacteristicsView;
