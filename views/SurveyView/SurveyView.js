/* globals d3 */
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
  setupLikertFields () {
    this.d3el.selectAll('[data-likert]').each(function () {
      const scale = this.dataset.likert.split(',');
      let likertChunks = d3.select(this).selectAll('.likertChunk').data(scale);
      likertChunks.exit().remove();
      const likertChunksEnter = likertChunks.enter().append('div')
        .classed('likertChunk', true);
      likertChunks = likertChunks.merge(likertChunksEnter);

      likertChunksEnter.append('input')
        .attr('type', 'radio')
        .attr('name', d => this.dataset.key)
        .attr('id', d => this.dataset.key + d.replace(/\s/g, ''))
        .attr('value', d => d);
      likertChunksEnter.append('label')
        .attr('for', d => this.dataset.key + d.replace(/\s/g, ''))
        .text(d => d);
    });
  }
  computeStateFromFormValues (formValues) {
    const enabled = this.isEnabled(formValues);
    if (enabled) {
      // Collect the current state of the fields
      for (const element of this.keyElements) {
        const key = element.dataset.key;
        if (element.dataset.likert) {
          // { data-key: radio value }
          const checkedRadio = d3.select(element).selectAll('[type="radio"]').nodes()
            .filter(d => d.checked)[0];
          if (checkedRadio) {
            formValues[key] = checkedRadio.value;
          }
        } else if (element.dataset.flag) {
          // { data-key: [data-flag value, data-flag value, ...] }
          formValues[key] = formValues[key] || [];
          if (element.checked) {
            formValues[element.dataset.key].push(element.dataset.flag);
          }
        } else if (element.dataset.role) {
          // { data-key: { data-role: element value } }
          formValues[key] = formValues[key] || {};
          formValues[key][element.dataset.role] = element.value;
        } else if (element.dataset.checkedValue) {
          // { data-key: data-checkedValue }
          if (element.checked) {
            formValues[key] = element.dataset.checkedValue;
          }
        } else {
          // { data-key: element value }
          formValues[key] = element.value;
        }
      }
      // Clean / validate values + flag invalid form elements
      const viewState = this.validateForm(formValues);

      // Store whether the view should be visible
      viewState.enabled = enabled;

      // Store the state of the view, relative to
      if (viewState.valid) {
        viewState.state = this.ownedResponseIndex === null ? 'complete' : 'changesValid';
      } else {
        viewState.state = this.ownedResponseIndex === null ? 'incomplete' : 'changesInvalid';
      }
      return viewState;
    } else {
      return {
        valid: true,
        enabled: false,
        state: 'hidden',
        invalidIds: {}
      };
    }
  }
  populateForm (formValues) {
    this.d3el.selectAll('[data-key]').each(function () {
      const key = this.dataset.key;
      if (this.dataset.likert) {
        for (const inputElement of d3.select(this).selectAll('input').nodes()) {
          inputElement.checked = formValues[key] === inputElement.value;
        }
      } else if (this.dataset.flag) {
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
