import SurveyController from './SurveyController.js';

import AlternateIntroView from '../views/AlternateIntroView/AlternateIntroView.js';
import TablesView from '../views/TablesView/TablesView.js';
import NetworkView from '../views/NetworkView/NetworkView.js';
import SpatialView from '../views/SpatialView/SpatialView.js';
import AlternateDebriefView from '../views/AlternateDebriefView/AlternateDebriefView.js';

// window.DEBUG_SURVEY_VIEW_INDEX = 1;

class ETS extends SurveyController {
  constructor () {
    super('DR.ETS', [
      AlternateIntroView,
      TablesView,
      NetworkView,
      SpatialView,
      AlternateDebriefView
    ]);

    // Redirect people to the main page until they've gone through the consent form
    if (!window.localStorage.getItem('consented')) {
      window.location.replace('/index.html');
    }
  }
}

window.controller = new ETS();
