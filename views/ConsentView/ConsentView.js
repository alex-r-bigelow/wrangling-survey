import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class ConsentView extends IntrospectableMixin(View) {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/ConsentView/style.less' },
      { type: 'text', url: 'views/ConsentView/template.html' }
    ]);
    this.enabled = true;
    this.humanLabel = 'Consent for Participation, Data Collection';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    this.d3el.select('.agree').on('click', () => {
      window.responses.resetCookie();
      window.controller.advanceSurvey('domain');
    });
  }
  draw () {}
  validateForm (formValues) {
    if (!formValues.cookie) {
      return null;
    }
  }
  getViewState (formValues, editingOldResponse) {
    if (formValues.cookie !== null) {
      return 'complete';
    } else {
      return 'incomplete';
    }
  }
}
export default ConsentView;
