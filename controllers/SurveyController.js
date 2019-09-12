/* globals d3 */
import Controller from './Controller.js';

class SurveyController extends Controller {
  constructor (tableName, viewClasses) {
    super();

    // Redirect people to the main page until they've gone through the consent form
    if (!window.localStorage.getItem('consented')) {
      window.location.replace('/index.html');
    }

    this.tableName = tableName;
    this.ownedResponseIndex = null;

    this.surveyViews = [];
    this.setupViews(viewClasses);
    this.currentSurveyViewIndex = window.DEBUG_SURVEY_VIEW_INDEX || 0;
  }
  setupViews (viewClasses) {
    const self = this;
    this.surveyViews = viewClasses.map(View => new View());
    const surveySections = d3.select('.survey .wrapper')
      .selectAll('details')
      .data(this.surveyViews)
      .enter().append('details')
      .on('toggle', function (d, i) {
        if (this.open) {
          self.advanceSurvey(i);
        }
      });
    const header = surveySections.append('summary');
    header.append('span')
      .text(d => d.humanLabel);
    surveySections.append('div')
      .attr('class', d => d.className);
    surveySections.each(function (viewInstance) {
      // Initial render is to assign a DOM element
      viewInstance.render(d3.select(this).select(`.${viewInstance.className}`));
    });
    // Extra render call does some cross-cutting form validation stuff, plus
    // sets up Controller's JTM metadata collection stuff after the DOM elements
    // are all there
    this.renderAllViews();
  }
  completeSurvey () {
    console.warn('unimplemented');
  }
  advanceSurvey (viewIndex = this.currentSurveyViewIndex + 1) {
    if (!this.surveyViews[viewIndex]) {
      this.completeSurvey();
    } else {
      this.currentSurveyViewIndex = viewIndex;
      this.forceInvalidFieldWarnings = false;
      this.surveyViews[viewIndex].trigger('open');
      this.renderAllViews();
    }
  }
  async renderAllViews () {
    const self = this;
    await super.renderAllViews();
    const formData = this.extractResponses();
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
    // Now that all the views have finished rendering, set up metadata collection
    // (relies on DOM elements already existing)
    this.setupJTM();
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
    const result = {
      formValues: {},
      viewStates: []
    };
    for (const viewInstance of this.surveyViews) {
      const enabled = viewInstance.isEnabled(result.formValues);
      if (enabled) {
        // Collect the current state of the fields
        for (const element of viewInstance.keyElements) {
          const key = element.dataset.key;
          if (element.dataset.flag) {
            // { data-key: [data-flag value, data-flag value, ...] }
            result.formValues[key] = result.formValues[key] || [];
            if (element.checked) {
              result.formValues[element.dataset.key].push(element.dataset.flag);
            }
          } else if (element.dataset.role) {
            // { data-key: { data-role: element value } }
            result.formValues[key] = result.formValues[key] || {};
            result.formValues[key][element.dataset.role] = element.value;
          } else if (element.dataset.checkedValue) {
            // { data-key: data-checkedValue }
            if (element.checked) {
              result.formValues[key] = element.dataset.checkedValue;
            }
          } else {
            // { data-key: element value }
            result.formValues[key] = element.value;
          }
        }
        // Clean / validate values + flag invalid form elements
        const viewState = viewInstance.validateForm(result.formValues);

        // Store whether the view should be visible
        viewState.enabled = enabled;

        // Store the state of the view, relative to
        if (viewState.valid) {
          viewState.state = this.unfinishedResponse === null ? 'complete' : 'changesValid';
        } else {
          viewState.state = this.unfinishedResponse === null ? 'incomplete' : 'invalid';
        }
        result.viewStates.push(viewState);
      } else {
        result.viewStates.push({
          valid: true,
          enabled: false,
          state: 'hidden',
          invalidIds: {}
        });
      }
    }
    result.valid = Object.values(result.viewStates).every(viewState => viewState.valid);
    result.invalidIds = Object.assign({}, ...Object.values(result.viewStates).map(viewState => viewState.invalidIds || {}));

    // Compare to previous data (i.e. if the user is editing)
    const ownedResponse = this.getOwnedResponse();
    if (ownedResponse) {
      result.priorFormValues = ownedResponse;
      // TODO: compute a diff?
    }
    return result;
  }
}

export default SurveyController;
