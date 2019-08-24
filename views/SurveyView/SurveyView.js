import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class SurveyView extends IntrospectableMixin(View) {
  constructor () {
    super(...arguments);
    this.keyElements = [];
  }
  collectKeyElements () {
    this.keyElements = this.d3el.selectAll('[data-key]').nodes();
  }
  getNextView () {
    console.warn(`getNextView not implemented for ${this.type}`);
  }
  populateForm (formValues) {
    console.warn(`populateForm not implemented for ${this.type}`);
  }
  isEnabled (formValues) {
    console.warn(`isEnabled not implemented for ${this.type}`);
  }
  validateForm (formValues) {
    console.warn(`validateForm not implemented for ${this.type}`);
    return {
      valid: true,
      invalidIds: {}
    };
  }
}
export default SurveyView;
