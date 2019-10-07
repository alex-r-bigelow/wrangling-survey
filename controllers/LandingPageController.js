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
    this.currentSurveyViewIndex = this.surveyViews.length;
    this.on('load', () => { this.advanceSurvey(); });
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
