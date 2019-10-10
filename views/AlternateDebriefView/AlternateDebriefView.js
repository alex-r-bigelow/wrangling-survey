import SurveyView from '../SurveyView/SurveyView.js';

class AlternateDebriefView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/AlternateDebriefView/style.less' },
      { type: 'text', url: 'views/AlternateDebriefView/template.html' }
    ]);
    this.humanLabel = 'Debrief';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    this.d3el.selectAll('.datasetLabel').text(window.controller.params.datasetLabel);
    this.d3el.selectAll('.targetType').text(window.controller.params.targetType);
    super.setupLikertFields();
    this.collectKeyElements();
  }
  isEnabled () {
    return true;
  }
  validateForm (formValues) {
    const invalidIds = super.requireFields(formValues, [
      'hardToImagine',
      'newQuestions',
      'inaccurate',
      'useful',
      'moreLikely',
      'needsNewData',
      'planToReshape',
      'hardInPractice'
    ]);
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default AlternateDebriefView;
