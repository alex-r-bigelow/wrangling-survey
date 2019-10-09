import SurveyView from '../SurveyView/SurveyView.js';

class AlternateIntroView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/AlternateIntroView/style.less' },
      { type: 'text', url: 'views/AlternateIntroView/neverConsidered.html' },
      { type: 'text', url: 'views/AlternateIntroView/consideredNotExplored.html' },
      { type: 'text', url: 'views/AlternateIntroView/alreadyExplored.html' },
      { type: 'text', url: 'views/AlternateIntroView/tabularCreativeProdding.html' },
      { type: 'text', url: 'views/AlternateIntroView/networkCreativeProdding.html' },
      { type: 'text', url: 'views/AlternateIntroView/spatialCreativeProdding.html' },
      { type: 'text', url: 'views/AlternateIntroView/groupedCreativeProdding.html' },
      { type: 'text', url: 'views/AlternateIntroView/textualCreativeProdding.html' },
      { type: 'text', url: 'views/AlternateIntroView/mediaCreativeProdding.html' }
    ]);
    this.humanLabel = 'Exploring Alternatives';
  }
  setup () {
    if (window.controller.params.priorAlternateCount > 0) {
      this.d3el.html(this.resources[3]);
    } else if (window.controller.params.nativeThinking !== 'Never') {
      this.d3el.html(this.resources[2]);
    } else {
      this.d3el.html(this.resources[1]);
    }
    this.creativeProdding = {
      'tabular': this.resources[4],
      'network': this.resources[5],
      'spatial': this.resources[6],
      'grouped': this.resources[7],
      'textual': this.resources[8],
      'media': this.resources[9]
    };
    this.d3el.selectAll('.datasetLabel').text(window.controller.params.datasetLabel);
    this.d3el.selectAll('.targetType').text(window.controller.params.targetType);
    this.d3el.select('.creativeProdding').html(this.creativeProdding[window.controller.params.targetType]);
    this.collectKeyElements();
  }
  isEnabled () {
    return true;
  }
  validateForm (formValues) {
    return {
      valid: true,
      invalidIds: {}
    };
  }
}
export default AlternateIntroView;
