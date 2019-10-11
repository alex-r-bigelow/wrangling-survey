import SurveyController from './SurveyController.js';

import AlternateIntroView from '../views/AlternateIntroView/AlternateIntroView.js';
import TablesView from '../views/TablesView/TablesView.js';
import NetworkView from '../views/NetworkView/NetworkView.js';
import SpatialView from '../views/SpatialView/SpatialView.js';
import GroupedView from '../views/GroupedView/GroupedView.js';
import TextualView from '../views/TextualView/TextualView.js';
import MediaView from '../views/MediaView/MediaView.js';
import AlternateDebriefView from '../views/AlternateDebriefView/AlternateDebriefView.js';

class ETS extends SurveyController {
  constructor () {
    super('DR.ETS', [
      AlternateIntroView,
      TablesView,
      NetworkView,
      SpatialView,
      GroupedView,
      TextualView,
      MediaView,
      AlternateDebriefView
    ]);

    this.params = Object.fromEntries(new URLSearchParams(window.location.search));

    const hasNeededParams = JSON.stringify(Object.keys(this.params).sort()) ===
      '["datasetLabel","nativeRawData","nativeThinking","otherPriors","priorAlternateCount","targetType","timestamp"]';

    // Redirect people to the main page if they haven't consented yet, or if
    // the URL got mangled somehow
    if (!window.localStorage.getItem('consented') || !hasNeededParams) {
      window.location.replace('index.html');
    }

    this.params.priorAlternateCount = parseInt(this.params.priorAlternateCount);
    this.params.otherPriors = JSON.parse(this.params.otherPriors);
  }
  extractResponses (defaultFormValues = {}) {
    return super.extractResponses(Object.assign({}, this.params, defaultFormValues));
  }
}

window.controller = new ETS();