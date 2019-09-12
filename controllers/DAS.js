import SurveyController from './SurveyController.js';

import DomainView from '../views/DomainView/DomainView.js';
import DataTypeView from '../views/DataTypeView/DataTypeView.js';
import TablesView from '../views/TablesView/TablesView.js';
import NetworkView from '../views/NetworkView/NetworkView.js';
import SpatialView from '../views/SpatialView/SpatialView.js';
import TextView from '../views/TextView/TextView.js';
import DebriefView from '../views/DebriefView/DebriefView.js';

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
  }
}

window.controller = new DAS();
