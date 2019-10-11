import SurveyController from './SurveyController.js';

import ConsentView from '../views/ConsentView/ConsentView.js';
import GdprView from '../views/GdprView/GdprView.js';
import SettingsView from '../views/SettingsView/SettingsView.js';
import DashboardView from '../views/DashboardView/DashboardView.js';

class LandingPageController extends SurveyController {
  constructor () {
    super('DR.UID', [
      ConsentView,
      GdprView,
      SettingsView,
      DashboardView
    ]);
    this.currentSurveyViewIndex = 0;
    this.on('load', () => { this.advanceSurvey(this.surveyViews.length - 1); });
  }
  get unfinishedResponse () {
    if (super.unfinishedResponse) {
      return super.unfinishedResponse;
    }
    // Always treat contact settings as "unfinished;" we'll never have access to
    // the submitted response in Google docs because it's private, but it will
    // still be hanging around in pendingResponseStrings (and will never get
    // cleared out)
    const responseStrings = this.database.pendingResponseStrings[this.tableName];
    if (!responseStrings) {
      return null;
    }
    return JSON.parse(responseStrings[responseStrings.length - 1]);
  }
  async advanceSurvey (viewIndex = this.currentSurveyViewIndex + 1) {
    const formData = this.extractResponses();
    // First check if all the views up to viewIndex are either valid or disabled
    let forcedIndex = 0;
    while (this.surveyViews[forcedIndex] && forcedIndex < viewIndex) {
      if (this.surveyViews[forcedIndex].isEnabled(formData.formValues) &&
          !formData.viewStates[forcedIndex].valid) {
        viewIndex = forcedIndex;
        this.forceInvalidFieldWarnings = true;
        break;
      }
      forcedIndex++;
    }
    if (forcedIndex === viewIndex) {
      // We've made it this far okay; continue as long as views are disabled
      this.forceInvalidFieldWarnings = false;
      while (this.surveyViews[viewIndex] && !this.surveyViews[viewIndex].isEnabled(formData.formValues)) {
        viewIndex++;
      }
    }
    if (this.surveyViews[viewIndex]) {
      this.currentSurveyViewIndex = viewIndex;
      this.surveyViews[viewIndex].trigger('open');
      this.renderAllViews(formData);
    }
    return viewIndex;
  }
}

window.controller = new LandingPageController();
