/* globals d3 */
import Controller from './Controller.js';
import GlossaryView from '../views/GlossaryView/GlossaryView.js';

class SurveyController extends Controller {
  constructor (tableName) {
    super();
    this.tableName = tableName;

    this.msErrorText = `Thank you for being willing to take our survey! \
Unfortunately, IE and Edge can't render the survey correctly; please take \
the survey using Firefox or Chrome. If you don't have these browsers \
installed, please ask Alex about borrowing a device.`;
  }
  async finishSetup () {
    // Auto-advance on page load to wherever the user left off
    this.advanceSection(this.surveyViews.length - 1);
    // Is the user currently working on a response to this survey? If so,
    // pre-populate with values they already chose
    if (this.unfinishedResponse) {
      for (const view of this.surveyViews) {
        view.populateForm(this.unfinishedResponse);
      }
    }
    // TODO: this is an ugly patch for public / private fields, because pseudo-elements can't exist inside form fields. Move this:
    d3.selectAll('input, textarea').each(function () {
      const privacyLogo = document.createElement('img');
      this.insertAdjacentElement('afterend', privacyLogo);
      d3.select(privacyLogo)
        .classed('privacyLogo', true)
        .attr('src', d3.select(this).classed('private') ? 'img/lock.svg' : 'img/eye.svg');
    });

    await this.renderAllViews();
    this.glossary.updateTerminology();

    for (const view of this.surveyViews) {
      view.setupSurveyListeners();
    }
  }
  async setupViews () {
    [this.glossary] = await this.setupViewList([ GlossaryView ], '.sidebar');
    this.surveyViews = await this.setupViewList(this.viewClassList, '.survey');
  }
  async advanceSection (viewIndex = this.currentViewIndex + 1) {
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
      if (this.currentViewIndex !== viewIndex) {
        this.surveyViews[viewIndex].trigger('open');
      }
      this.currentViewIndex = viewIndex;
      this.renderAllViews(formData);
    }
    return viewIndex;
  }
  async renderAllViews (formData = this.extractResponses()) {
    await super.renderAllViews();
    const self = this;
    d3.select('.survey .wrapper')
      .selectAll('details')
      .attr('class', (d, i) => {
        let baseClass = formData.viewStates[i].state;
        let j = this.currentViewIndex;
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
      .property('open', (d, i) => i === this.currentViewIndex)
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
              self.advanceSection();
            }
          });
      });
    const glossaryDetailsElement = d3.select(this.glossary.d3el.node().parentNode);
    if (this.glossary.isVisible()) {
      glossaryDetailsElement.style('display', null);
      this.glossary.render();
    } else {
      glossaryDetailsElement.style('display', 'none');
    }
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
