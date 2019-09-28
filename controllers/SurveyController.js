/* globals d3, less */
import { Model } from '../node_modules/uki/dist/uki.esm.js';
import Database from '../models/Database.js';
import GlossaryView from '../views/GlossaryView/GlossaryView.js';

import recolorImageFilter from '../utils/recolorImageFilter.js';

class SurveyController extends Model {
  constructor (tableName, viewClasses) {
    super();
    this.database = new Database();
    this.database.on('update', () => { this.renderAllViews(); });

    this.glossary = new GlossaryView();
    this.initialPaneIndex = 0;

    this.tableName = tableName;
    this.ownedResponseIndex = null;

    this.surveyViews = [];
    this.currentSurveyViewIndex = window.DEBUG_SURVEY_VIEW_INDEX || 0;

    window.onresize = () => { this.renderAllViews(); };
    (async () => {
      await this.setupViews(viewClasses);
      this.setupSurveyListeners();
      // Is the user currently working on a response to this survey? If so,
      // pre-populate with values they already chose
      if (this.unfinishedResponse) {
        for (const view of this.surveyViews) {
          view.populateForm(this.unfinishedResponse);
        }
      }
      this.glossary.connectTerminology();
      this.finishSetup();
      await less.pageLoadFinished;
      // Wait for LESS to finish loading before applying our SVG
      // filter hack
      recolorImageFilter();
      // Extra render call does form validation
      this.renderAllViews();
    })();
  }
  async setupViews (viewClasses) {
    const self = this;
    this.surveyViews = viewClasses.map(View => new View());
    const surveySections = d3.select('.survey .wrapper')
      .selectAll('details')
      .data(this.surveyViews)
      .enter().append('details')
      .on('toggle.survey', function (d, i) {
        if (this.open) {
          self.advanceSurvey(i);
        }
      });
    const header = surveySections.append('summary');
    header.append('span')
      .text(d => d.humanLabel);
    surveySections.append('div')
      .attr('class', d => d.className);
    await Promise.all(surveySections.nodes().map(node => {
      const d3el = d3.select(node);
      const viewInstance = d3el.datum();
      // Assign DOM elements to each view, and ensure views create all their DOM
      // elements before the next cross-cutting steps
      return viewInstance.render(d3.select(node).select(`.${viewInstance.className}`));
    }));
  }
  setupSurveyListeners () {
    let debounceTimeout;
    const self = this;
    const getDebouncedChangeHandler = (delay, refocus = false) => {
      return function () {
        window.clearTimeout(debounceTimeout);
        debounceTimeout = window.setTimeout(async () => {
          const formData = self.extractResponses();
          self.database.setResponse(self.tableName, formData.formValues);
          self.glossary.updateTerminology(formData.formValues.terminology);
          await self.renderAllViews(formData);
          if (refocus) {
            this.focus();
          }
        }, delay);
      };
    };
    const standardHandler = getDebouncedChangeHandler(300);
    d3.selectAll('[data-key]').on('change', standardHandler);
    d3.selectAll('[data-key][type="radio"], [data-key][type="checkbox"]')
      .on('click', standardHandler);
    d3.selectAll('textarea[data-key], [type="text"][data-key]')
      .on('keyup', getDebouncedChangeHandler(1000, true));
    for (const view of this.surveyViews) {
      view.on('formValuesChanged', standardHandler);
    }
  }
  focusPane (target) {
    d3.selectAll('.pageSlice').classed('unfocused', function () {
      return this !== target;
    });
  }
  finishSetup () {
    const self = this;

    // For small screens, collapse large horizontal panes that aren't being used
    d3.selectAll('.pageSlice')
      .classed('unfocused', (d, i) => i !== this.initialPaneIndex)
      .on('click', function () {
        if (d3.select(this).classed('unfocused')) {
          self.focusPane(this);
          d3.event.preventDefault();
        }
      });

    // TODO: this is an ugly patch for public / private fields, because pseudo-elements can't exist inside form fields. Move this:
    d3.selectAll('input, textarea').each(function () {
      const privacyLogo = document.createElement('img');
      this.insertAdjacentElement('afterend', privacyLogo);
      d3.select(privacyLogo)
        .classed('privacyLogo', true)
        .attr('src', d3.select(this).classed('private') ? 'img/lock.svg' : 'img/eye.svg');
    });
  }
  async advanceSurvey (viewIndex = this.currentSurveyViewIndex + 1) {
    const formData = this.extractResponses();
    while (this.surveyViews[viewIndex] && !this.surveyViews[viewIndex].isEnabled(formData.formValues)) {
      viewIndex++;
    }
    this.database.setResponse(this.tableName, formData.formValues);
    if (this.surveyViews[viewIndex]) {
      this.currentSurveyViewIndex = viewIndex;
      this.forceInvalidFieldWarnings = false;
      this.surveyViews[viewIndex].trigger('open');
      this.renderAllViews(formData);
    }
  }
  async renderAllViews (formData = this.extractResponses()) {
    const self = this;
    d3.select('.survey .wrapper')
      .selectAll('details')
      .attr('class', (d, i) => formData.viewStates[i].state)
      .property('open', (d, i) => i === this.currentSurveyViewIndex)
      .style('display', (d, i) => formData.viewStates[i].enabled ? null : 'none')
      .each(function (d, i) {
        d3.select(this).select('.next.button')
          .classed('disabled', !formData.viewStates[i].valid)
          .on('click', () => {
            if (!formData.viewStates[i].valid) {
              self.forceInvalidFieldWarnings = true;
              self.renderAllViews();
            } else {
              self.advanceSurvey();
            }
          });
        d3.select(this).select('.submit.button')
          .classed('disabled', !formData.valid)
          .on('click', async () => {
            if (formData.valid) {
              this.database.setResponse(this.tableName, formData.formValues);
              await this.database.submitResponse(this.tableName);
              window.location.replace('/index.html');
            }
          });
      });
    d3.selectAll('.invalid').classed('invalid', false);
    if (this.forceInvalidFieldWarnings || this.ownedResponseIndex !== null) {
      // Only flag invalid fields as invalid if the user has attempted to
      // advance with the next button, or if they're editing something they
      // already submitted
      for (const invalidId of Object.keys(formData.invalidIds)) {
        d3.select(`#${invalidId}`).classed('invalid', true);
      }
    }
    await Promise.all(this.surveyViews.map(view => view.render()));
  }
  get unfinishedResponse () {
    return this.database.unfinishedResponses[this.tableName] || null;
  }
  async getOwnedResponse () {
    if (this.ownedResponseIndex === null) {
      return null;
    }
    const temp = await this.database.getOwnedResponse(this.tableName);
    return temp ? temp[this.ownedResponseIndex] : null;
  }
  extractResponses () {
    const formData = {
      formValues: {},
      viewStates: []
    };
    for (const viewInstance of [this.glossary].concat(this.surveyViews)) {
      const enabled = viewInstance.isEnabled(formData.formValues);
      if (enabled) {
        // Collect the current state of the fields
        for (const element of viewInstance.keyElements) {
          const key = element.dataset.key;
          if (element.dataset.flag) {
            // { data-key: [data-flag value, data-flag value, ...] }
            formData.formValues[key] = formData.formValues[key] || [];
            if (element.checked) {
              formData.formValues[element.dataset.key].push(element.dataset.flag);
            }
          } else if (element.dataset.role) {
            // { data-key: { data-role: element value } }
            formData.formValues[key] = formData.formValues[key] || {};
            formData.formValues[key][element.dataset.role] = element.value;
          } else if (element.dataset.checkedValue) {
            // { data-key: data-checkedValue }
            if (element.checked) {
              formData.formValues[key] = element.dataset.checkedValue;
            }
          } else {
            // { data-key: element value }
            formData.formValues[key] = element.value;
          }
        }
        // Clean / validate values + flag invalid form elements
        const viewState = viewInstance.validateForm(formData.formValues);

        // Store whether the view should be visible
        viewState.enabled = enabled;

        // Store the state of the view, relative to
        if (viewState.valid) {
          viewState.state = this.unfinishedResponse === null ? 'complete' : 'changesValid';
        } else {
          viewState.state = this.unfinishedResponse === null ? 'incomplete' : 'invalid';
        }
        formData.viewStates.push(viewState);
      } else {
        formData.viewStates.push({
          valid: true,
          enabled: false,
          state: 'hidden',
          invalidIds: {}
        });
      }
    }
    formData.valid = Object.values(formData.viewStates).every(viewState => viewState.valid);
    formData.invalidIds = Object.assign({}, ...Object.values(formData.viewStates).map(viewState => viewState.invalidIds || {}));

    // Compare to previous data (i.e. if the user is editing)
    const ownedResponse = this.getOwnedResponse();
    if (ownedResponse) {
      formData.priorFormValues = ownedResponse;
      // TODO: compute a diff?
    }
    return formData;
  }
}

export default SurveyController;
