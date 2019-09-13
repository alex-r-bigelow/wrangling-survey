import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class SurveyView extends IntrospectableMixin(View) {
  constructor () {
    super(...arguments);
    this.keyElements = [];
  }
  get className () {
    return this.type;
  }
  collectKeyElements () {
    this.keyElements = this.d3el.selectAll('[data-key]').nodes();
  }
  populateForm (formValues) {
    this.d3el.selectAll('[data-key]').each(function () {
      const key = this.dataset.key;
      if (this.dataset.flag) {
        // { data-key: [data-flag value, data-flag value, ...] }
        this.checked = formValues[key] &&
          formValues[key].indexOf(this.dataset.flag) !== -1;
      } else if (this.dataset.role) {
        // { data-key: { data-role: element value } }
        let value = formValues[key] && formValues[this.dataset.role];
        if (value === undefined) {
          value = '';
        }
        this.value = value;
      } else if (this.dataset.checkedValue) {
        // { data-key: data-checkedValue }
        this.checked = formValues[key] === this.dataset.checkedValue;
      } else {
        // { data-key: element value }
        let value = formValues[key];
        if (value === undefined) {
          value = '';
        }
        this.value = value;
      }
    });
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
