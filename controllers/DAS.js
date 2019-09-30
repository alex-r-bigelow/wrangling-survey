import SurveyController from './SurveyController.js';

import DomainView from '../views/DomainView/DomainView.js';
import DataTypeView from '../views/DataTypeView/DataTypeView.js';
import TablesView from '../views/TablesView/TablesView.js';
import NetworkView from '../views/NetworkView/NetworkView.js';
import SpatialView from '../views/SpatialView/SpatialView.js';
import TextView from '../views/TextView/TextView.js';
import DebriefView from '../views/DebriefView/DebriefView.js';

window.DEBUG_SURVEY_VIEW_INDEX = 0;

class DAS extends SurveyController {
  constructor () {
    super('DR.DAS', [
      DomainView,
      DataTypeView,
      TablesView,
      NetworkView,
      SpatialView,
      TextView,
      DebriefView
    ]);

    // Redirect people to the main page until they've gone through the consent form
    if (!window.localStorage.getItem('consented')) {
      window.location.replace('/index.html');
    }
  }
}

window.controller = new DAS();
