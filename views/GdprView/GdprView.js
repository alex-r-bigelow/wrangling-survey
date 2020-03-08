import SurveyView from '../SurveyView/SurveyView.js';

class GdprView extends SurveyView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/GdprView/style.less' },
      { type: 'text', url: 'views/GdprView/template.html' }
    ]);
    this.humanLabel = 'GDPR Addendum';
  }
  setup () {
    super.setup();
    this.d3el.html(this.resources[1]);
    this.d3el.select('.agree').on('click', () => {
      window.controller.advanceSection();
    });
    this.collectKeyElements();
  }
  draw () {
    super.draw();
    const consented = this.d3el.selectAll('#gdprReleaseOk, #gdprFutureOk')
      .nodes().reduce((agg, node) => agg && node.checked, true);
    this.d3el.select('.agree')
      .classed('disabled', !consented);
  }
  isVisible (formValues) {
    return formValues.isEuCitizen === 'True';
  }
  validateForm (formValues) {
    const invalidIds = this.requireFields(formValues, [
      'gdprFutureOk',
      'gdprReleaseOk'
    ]);
    return {
      valid: Object.keys(invalidIds).length === 0,
      invalidIds
    };
  }
}
export default GdprView;
