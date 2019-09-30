import SurveyController from './SurveyController.js';

import ConsentView from '../views/ConsentView/ConsentView.js';
import SettingsView from '../views/SettingsView/SettingsView.js';
import DashboardView from '../views/DashboardView/DashboardView.js';

// window.DEBUG_SURVEY_VIEW_INDEX = 2;

class LandingPageController extends SurveyController {
  constructor () {
    super('DR.UID', [
      ConsentView,
      SettingsView,
      DashboardView
    ]);
    const consented = window.localStorage.getItem('consented');
    if (!consented) {
      this.currentSurveyViewIndex = 0;
    } else {
      this.currentSurveyViewIndex = window.localStorage.getItem('mainViewIndex') || 1;
    }
  }
  async advanceSurvey (viewIndex) {
    if (!window.localStorage.getItem('consented')) {
      viewIndex = 0;
    }
    super.advanceSurvey(viewIndex);
  }
}

window.controller = new LandingPageController();
