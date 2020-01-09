import VisView from '../VisView/VisView.js';

class SpatialResponseDasView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/SpatialView/style.less' },
      { type: 'text', url: 'views/SpatialView/template.html' }
    ]);
    this.humanLabel = 'Initial Spatial / Temporal Data Details';
    this.responseType = 'dasResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
  }
  filterTransition (transition) {
    return transition.dasResponse.spatialThinking !== 'Never';
  }
}

class SpatialResponseEtsView extends SpatialResponseDasView {
  constructor (div) {
    super(div);
    this.humanLabel = 'Alternative Spatial / Temporal Data Details';
    this.responseType = 'etsResponse';
  }
  filterTransition (transition) {
    return transition.etsResponse.targetType === 'spatial';
  }
}
export { SpatialResponseDasView, SpatialResponseEtsView };
