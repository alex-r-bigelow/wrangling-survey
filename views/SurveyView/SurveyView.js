/* globals d3 */
import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class SurveyView extends IntrospectableMixin(View) {
  constructor (div, resourceList = []) {
    super(div, resourceList.concat([
      { type: 'text', url: 'views/SurveyView/protest.html' },
      { type: 'text', url: 'views/SurveyView/wrongWay.html' }
    ]));
    this.keyElements = [];
    this.protesting = false;
    this.wrongWay = false;
    this.on('open', () => {
      let header = this.d3el.node();
      header = header && d3.select(header.parentNode).select('summary').node();
      if (header) {
        header.scrollIntoView();
      }
    });
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
      const inspectableTerms = (this.dataset.inspectable || '').split(',');
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
        .classed('inspectable', d => inspectableTerms.indexOf(d) !== -1)
        .text(d => d);
    });
  }
  setupSurveyListeners () {
    let debounceTimeout;
    const getDebouncedChangeHandler = (delay, refocus = false) => {
      return function () {
        window.clearTimeout(debounceTimeout);
        debounceTimeout = window.setTimeout(async () => {
          const formData = window.controller.extractResponses();
          window.controller.database.setResponse(window.controller.tableName, formData.formValues);
          window.controller.glossary.updateTerminology(formData.formValues.terminology);
          await window.controller.renderAllViews(formData);
          if (refocus) {
            this.focus();
          }
        }, delay);
      };
    };
    const standardHandler = getDebouncedChangeHandler(0);
    this.d3el.selectAll('[data-key]').on('change.survey', standardHandler);
    this.d3el.selectAll('[data-key][type="radio"], [data-key][type="checkbox"]')
      .on('click.survey', standardHandler);
    this.d3el.selectAll('.likert [type="radio"]')
      .on('click.survey', standardHandler);
    this.d3el.selectAll('textarea[data-key], [type="text"][data-key]')
      .on('keyup.survey', getDebouncedChangeHandler(1000, true));
  }
  setupProtest () {
    if (this.d3el.select('.protest.button').node()) {
      this.d3el.insert('div', '.hideIfProtesting + *')
        .classed('showIfProtesting', true)
        .html(this.resources[this.resources.length - 2]);
      this.d3el.select('.protest.button').on('click', () => {
        this.protesting = true;
        this.wrongWay = false;
        const wrongWayReason = this.d3el.select('[data-key="wrongWay"]');
        if (wrongWayReason) {
          this.d3el.select('[data-key="protest"]')
            .property(wrongWayReason);
          this.d3el.select('[data-key="wrongWay"]')
            .property('value', '');
        }
        this.drawProtest();
      });
    }
    if (this.d3el.select('.wrongWay.button').node()) {
      this.d3el.insert('div', '.hideIfProtesting + *')
        .classed('showIfWrongWay', true)
        .html(this.resources[this.resources.length - 1]);
      this.d3el.select('.wrongWay.button').on('click', () => {
        this.protesting = false;
        this.wrongWay = true;
        this.drawProtest();
      });
    }
    this.d3el.select('.restore.button').on('click', () => {
      this.protesting = false;
      this.wrongWay = false;
      this.d3el.selectAll('[data-key="protest"], [data-key="wrongWay"]')
        .property('value', '');
      this.drawProtest();
    });
    this.drawProtest();
  }
  drawProtest () {
    this.d3el.select('.hideIfProtesting').style('display', this.protesting || this.wrongWay ? 'none' : null);
    this.d3el.select('.protest.button').style('display', this.protesting ? 'none' : null);
    this.d3el.select('.restore.button').style('display', this.protesting || this.wrongWay ? null : 'none');
    this.d3el.select('.showIfProtesting').style('display', this.protesting ? null : 'none');
    this.d3el.select('.showIfWrongWay').style('display', this.wrongWay ? null : 'none');
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
          formValues[key][element.dataset.role] = element.type === 'checkbox' ? element.checked : element.value;
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
        viewState.state = window.controller.ownedResponseIndex === null ? 'complete' : 'changesValid';
      } else {
        viewState.state = window.controller.ownedResponseIndex === null ? 'incomplete' : 'changesInvalid';
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
    /* if (formValues.protest) {
      this.protesting = true;
      this.drawProtest();
    } else if (formValues.wrongWay) {
      this.wrongWay = true;
      this.drawProtest();
    } */
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
        if (this.type === 'checkbox') {
          this.checked = !!value;
        } else {
          if (value === undefined) {
            value = '';
          }
          this.value = value;
        }
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
  requireFields (formValues, requiredFields) {
    const invalidIds = {};
    for (const field of requiredFields) {
      if (formValues[field] === undefined) {
        invalidIds[field] = true;
      }
    }
    return invalidIds;
  }
}
export default SurveyView;
