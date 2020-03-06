/* globals d3, less */
import { Model } from '../node_modules/uki/dist/uki.esm.js';
import Database from '../models/Database.js';
import GlossaryView from '../views/GlossaryView/GlossaryView.js';

import recolorImageFilter from '../utils/recolorImageFilter.js';

class SurveyController extends Model {
  constructor (tableName, viewClasses) {
    super();
    this.initialPaneIndex = 0;
    this.tableName = tableName;
    this.currentSurveyViewIndex = 0;

    this.database = new Database();
    this.database.on('update', () => {
      this.renderAllViews();
      this.glossary.updateTerminology(this.database.terminology);
    });

    this.glossary = new GlossaryView();


    this.surveyViews = [];

    // detect IE8 and above, and edge
    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
      window.alert(`Thank you for being willing to take our survey! Unfortunately,
IE and Edge can't render the survey correctly; please take the survey
using Firefox or Chrome. If you don't have these browsers
installed, please ask Alex about borrowing a device.`);
    }

    // Auto-advance on page load to wherever the user left off
    this.on('load', () => { this.advanceSurvey(this.surveyViews.length - 1); });

    window.onresize = () => { this.renderAllViews(); };
    (async () => {
      await this.setupViews(viewClasses);
      this.glossary.collectTerminology();
      // Is the user currently working on a response to this survey? If so,
      // pre-populate with values they already chose
      if (this.unfinishedResponse) {
        for (const view of this.surveyViews) {
          view.populateForm(this.unfinishedResponse);
        }
      }
      this.finishSetup();
      await less.pageLoadFinished;
      // Wait for LESS to finish loading before applying our SVG
      // filter hack
      recolorImageFilter();
      // Extra render call does form validation
      await this.renderAllViews();
      d3.select('.spinner').style('display', 'none');
      this.trigger('load');
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
    header.append('div')
      .html(d => d.humanLabel);
    header.append('img')
      .classed('statusIndicator', true);
    surveySections.append('div')
      .attr('class', d => d.className);
    await Promise.all(surveySections.nodes().map(async node => {
      const d3el = d3.select(node);
      const viewInstance = d3el.datum();
      // Assign DOM elements to each view, and ensure views create all their DOM
      // elements before the next cross-cutting steps
      await viewInstance.render(d3.select(node).select(`.${viewInstance.className}`));
      viewInstance.setupSurveyListeners();
    }));
  }
  finishSetup () {
    this.glossary.hide();

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
    // First check if all the views up to viewIndex are either valid or disabled
    let forcedIndex = 0;
    while (this.surveyViews[forcedIndex] && forcedIndex < viewIndex) {
      if (this.surveyViews[forcedIndex].isVisible(formData.formValues) &&
          (!formData.viewStates[forcedIndex].valid || this.surveyViews[forcedIndex].stall)) {
        viewIndex = forcedIndex;
        this.forceInvalidFieldWarnings = true;
        break;
      }
      forcedIndex++;
    }
    if (forcedIndex === viewIndex) {
      // We've made it this far okay; continue as long as views are disabled
      this.forceInvalidFieldWarnings = false;
      while (this.surveyViews[viewIndex] && !this.surveyViews[viewIndex].isVisible(formData.formValues)) {
        viewIndex++;
      }
    }
    if (this.surveyViews[viewIndex]) {
      if (this.currentSurveyViewIndex !== viewIndex) {
        this.surveyViews[viewIndex].trigger('open');
      }
      this.currentSurveyViewIndex = viewIndex;
      this.renderAllViews(formData);
    }
    return viewIndex;
  }
  async renderAllViews (formData = this.extractResponses()) {
    const self = this;
    d3.select('.survey .wrapper')
      .selectAll('details')
      .attr('class', (d, i) => {
        let baseClass = formData.viewStates[i].state;
        let j = this.currentSurveyViewIndex;
        while (j < i) {
          if (self.surveyViews[j].stall ||
              (formData.viewStates[j].visible &&
              !formData.viewStates[j].valid)) {
            return baseClass + ' disabled';
          }
          j++;
        }
        return baseClass;
      })
      .property('open', (d, i) => i === this.currentSurveyViewIndex)
      .style('display', (d, i) => formData.viewStates[i].visible ? null : 'none')
      .each(function (d, i) {
        const detailsElement = d3.select(this);
        const state = formData.viewStates[i].state;
        detailsElement.select('.statusIndicator')
          .style('display', state === 'incomplete' || state === 'hidden' ? 'none' : null)
          .attr('src', state === 'incomplete' || state === 'hidden' ? null : `img/${state}.svg`);
        detailsElement.select('.next.button')
          .classed('disabled', !formData.viewStates[i].valid)
          .on('click', () => {
            self.surveyViews[i].stall = false;
            if (!formData.viewStates[i].valid) {
              self.forceInvalidFieldWarnings = true;
              self.renderAllViews();
            } else {
              self.advanceSurvey();
            }
          });
      });
    this.glossary.render();
    this.renderSubmitButton(formData);
    d3.selectAll('.invalid').classed('invalid', false);
    if (this.forceInvalidFieldWarnings) {
      // Only flag invalid fields as invalid if the user has attempted to
      // advance with the next button
      for (const invalidId of Object.keys(formData.invalidIds)) {
        d3.select(`#${invalidId}`).classed('invalid', true);
      }
      d3.selectAll('.incomplete .statusIndicator')
        .attr('src', `img/changesInvalid.svg`);
    }
    await Promise.all(this.surveyViews.map(view => view.render()));
  }
  renderSubmitButton (formData) {
    d3.select('.submit.button')
      .classed('disabled', !formData.valid)
      .on('click', async () => {
        if (formData.valid) {
          this.database.setResponse(this.tableName, formData.formValues);
          await this.database.submitResponse(this.tableName);
          window.location.href = 'index.html';
        } else {
          this.forceInvalidFieldWarnings = true;
          this.renderAllViews();
        }
      });
  }
  get unfinishedResponse () {
    return this.database.unfinishedResponses[this.tableName] || null;
  }
  extractResponses (defaultFormValues = {}) {
    const formData = {
      formValues: Object.assign({}, defaultFormValues),
      viewStates: []
    };
    // Manipulate formValues for glossary, but don't store that state (important
    // because renderAllViews relies on the same ordering as this.surveyViews)
    this.glossary.computeStateFromFormValues(formData.formValues);
    for (const viewInstance of this.surveyViews) {
      formData.viewStates.push(viewInstance.computeStateFromFormValues(formData.formValues));
    }
    formData.valid = Object.values(formData.viewStates).every(viewState => viewState.valid);
    formData.invalidIds = Object.assign({}, ...Object.values(formData.viewStates).map(viewState => viewState.invalidIds || {}));

    return formData;
  }
}

export default SurveyController;
