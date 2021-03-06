import SurveyView from '../SurveyView/SurveyView.js';

class AboutView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/AboutView/style.less' },
      { type: 'text', url: 'views/AboutView/template.html' }
    ]);
    this.humanLabel = 'About this survey';
    this.on('open', () => {
      window.localStorage.setItem('enableGlossary', true);
      window.controller.renderAllViews();
    });
  }
  setup () {
    super.setup();
    this.d3el.html(this.resources[1]);
    this.d3el.select('#firstProtestButton').on('click', () => {
      window.localStorage.setItem('firstProtest', 'true');
      window.controller.advanceSection();
    });
    this.collectKeyElements();
  }
  isVisible () {
    return true;
  }
  validateForm (formValues) {
    const invalidIds = {};
    if (!window.localStorage.getItem('firstProtest')) {
      invalidIds['firstProtestButton'] = true;
    }
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default AboutView;
