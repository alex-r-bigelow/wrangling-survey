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

    this.params = Object.fromEntries(new URLSearchParams(window.location.search));

    const hasNeededParams = JSON.stringify(Object.keys(this.params).sort()) ===
      '["datasetLabel","nativeRawData","nativeThinking","priorAlternateCount","targetType","timestamp"]';

    // Redirect people to the main page if they haven't consented yet, or if
    // the URL got mangled somehow
    if (!window.localStorage.getItem('consented') || !hasNeededParams) {
      window.location.replace('/index.html');
    }

    this.params.priorAlternateCount = parseInt(this.params.priorAlternateCount);
  }
  extractResponses (defaultFormValues = {}) {
    return super.extractResponses(Object.assign({}, this.params, defaultFormValues));
  }
}

window.controller = new ETS();
