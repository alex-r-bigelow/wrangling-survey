import SurveyController from './SurveyController.js';

import DomainView from '../views/DomainView/DomainView.js';
import BasicCharacteristicsView from '../views/BasicCharacteristicsView/BasicCharacteristicsView.js';
import DataTypeView from '../views/DataTypeView/DataTypeView.js';
import TablesView from '../views/TablesView/TablesView.js';
import NetworkView from '../views/NetworkView/NetworkView.js';
import SpatialView from '../views/SpatialView/SpatialView.js';
import GroupedView from '../views/GroupedView/GroupedView.js';
import TextualView from '../views/TextualView/TextualView.js';
import MediaView from '../views/MediaView/MediaView.js';
import DebriefView from '../views/DebriefView/DebriefView.js';

class DAS extends SurveyController {
  constructor () {
    super('DR.DAS');

    // Redirect people to the main page until they've gone through the consent form
    if (!window.localStorage.getItem('consented')) {
      window.location.replace('index.html');
    }

    this.allowWrongWay = true;
  }
  get viewClassList () {
    return [
      DomainView,
      BasicCharacteristicsView,
      DataTypeView,
      TablesView,
      NetworkView,
      SpatialView,
      GroupedView,
      TextualView,
      MediaView,
      DebriefView
    ];
  }
}

window.controller = new DAS();
