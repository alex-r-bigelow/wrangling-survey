import VisView from '../VisView/VisView.js';

class SpatialResponseDasView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/SpatialView/style.less' },
      { type: 'text', url: 'views/SpatialView/template.html' }
    ]);
    this.humanLabel = 'Spatial / Temporal Data Details';
    this.responseType = 'dasResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
  }
  isVisible () {
    return true;
  }
}

class SpatialResponseEtsView extends SpatialResponseDasView {
  constructor (div) {
    super(div);
    this.responseType = 'etsResponse';
  }
}
export { SpatialResponseDasView, SpatialResponseEtsView };
