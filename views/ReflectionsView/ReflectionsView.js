import SurveyView from '../SurveyView/SurveyView.js';

class ReflectionsView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/ReflectionsView/style.less' },
      { type: 'text', url: 'views/ReflectionsView/template.html' }
    ]);
    this.humanLabel = 'Reflections';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    this.targetTypeLabels = {
      'tabular': '<span class="inspectable">tabular</span>',
      'network': '<span class="inspectable">network</span> or <span class="inspectable" data-core-term="hierarchy">hierarchical</span>',
      'spatial': '<span class="inspectable">spatial</span> or <span class="inspectable">temporal</span>',
      'grouped': '<span class="inspectable">grouped</span>',
      'textual': '<span class="inspectable">textual</span>',
      'media': '<span class="inspectable">media</span>'
    };
    this.d3el.selectAll('.datasetLabel').text(window.controller.params.datasetLabel);
    this.d3el.selectAll('.targetType').html(this.targetTypeLabels[window.controller.params.targetType]);
    this.setupProtest();
    this.setupLikertFields();
    this.collectKeyElements();
  }
  isVisible () {
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
export default ReflectionsView;
