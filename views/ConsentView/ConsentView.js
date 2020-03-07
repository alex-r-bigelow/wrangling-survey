import SurveyView from '../SurveyView/SurveyView.js';

class ConsentView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/ConsentView/style.less' },
      { type: 'text', url: 'views/ConsentView/template.html' }
    ]);
    this.humanLabel = 'Research Consent Form';
  }
  setup () {
    super.setup();
    this.d3el.html(this.resources[1]);
    this.d3el.select('.agree').on('click', () => {
      window.localStorage.setItem('consented', 'true');
      window.controller.advanceSection();
    });
    this.collectKeyElements();
  }
  draw () {
    super.draw();
    const consented = window.localStorage.getItem('consented') === 'true';
    this.d3el.select('.agree')
      .classed('disabled', consented);
    this.d3el.select('.consented')
      .style('display', consented ? null : 'none');
  }
  isVisible () {
    return true;
  }
  validateForm (formValues) {
    const invalidIds = {};
    if (!window.localStorage.getItem('consented')) {
      invalidIds['consentButton'] = true;
    }
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default ConsentView;
