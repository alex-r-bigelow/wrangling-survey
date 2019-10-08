import SurveyController from './SurveyController.js';

import ConsentView from '../views/ConsentView/ConsentView.js';
import GdprView from '../views/GdprView/GdprView.js';
import SettingsView from '../views/SettingsView/SettingsView.js';
import DashboardView from '../views/DashboardView/DashboardView.js';

// window.DEBUG_SURVEY_VIEW_INDEX = 3;

class LandingPageController extends SurveyController {
  constructor () {
    super('DR.UID', [
      ConsentView,
      GdprView,
      SettingsView,
      DashboardView
    ]);
    this.currentSurveyViewIndex = this.surveyViews.length - 1;
    this.on('load', () => { this.advanceSurvey(); });
  }
  get unfinishedResponse () {
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
    let forcedIndex = 0;
    while (this.surveyViews[forcedIndex] && forcedIndex < viewIndex) {
      if (this.surveyViews[forcedIndex].isEnabled(formData.formValues) &&
          (!formData.viewStates[forcedIndex].valid)) {
        break;
      }
      forcedIndex++;
    }
    this.forceInvalidFieldWarnings = forcedIndex < viewIndex;
    viewIndex = forcedIndex;
    if (this.surveyViews[viewIndex]) {
      this.currentSurveyViewIndex = viewIndex;
      this.surveyViews[viewIndex].trigger('open');
      this.renderAllViews(formData);
    }
    return viewIndex;
  }
}

window.controller = new LandingPageController();
