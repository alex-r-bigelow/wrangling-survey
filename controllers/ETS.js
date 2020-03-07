import SurveyController from './SurveyController.js';

import AlternateIntroView from '../views/AlternateIntroView/AlternateIntroView.js';
import TablesView from '../views/TablesView/TablesView.js';
import NetworkView from '../views/NetworkView/NetworkView.js';
import SpatialView from '../views/SpatialView/SpatialView.js';
import GroupedView from '../views/GroupedView/GroupedView.js';
import TextualView from '../views/TextualView/TextualView.js';
import MediaView from '../views/MediaView/MediaView.js';
import ReflectionsView from '../views/ReflectionsView/ReflectionsView.js';
import DebriefView from '../views/DebriefView/DebriefView.js';

class ETS extends SurveyController {
  constructor () {
    super('DR.ETS');

    this.params = Object.fromEntries(new URLSearchParams(window.location.search));

    const hasNeededParams = JSON.stringify(Object.keys(this.params).sort()) ===
      '["datasetLabel","datasetSubmitTimestamp","nativeRawData","nativeThinking","otherPriors","priorAlternateCount","targetType"]';

    // Redirect people to the main page if they haven't consented yet, or if
    // the URL got mangled somehow
    if (!window.localStorage.getItem('consented') || !hasNeededParams) {
      window.location.replace('index.html');
    }

    this.params.priorAlternateCount = parseInt(this.params.priorAlternateCount);
    this.params.otherPriors = JSON.parse(this.params.otherPriors);
  }
  get viewClassList () {
    return [
      AlternateIntroView,
      TablesView,
      NetworkView,
      SpatialView,
      GroupedView,
      TextualView,
      MediaView,
      ReflectionsView,
      DebriefView
    ];
  }
  extractResponses (defaultFormValues = {}) {
    return super.extractResponses(Object.assign({}, this.params, defaultFormValues));
  }
}

window.controller = new ETS();
