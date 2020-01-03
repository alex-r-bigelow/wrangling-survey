import VisView from '../VisView/VisView.js';

class MediaResponseDasView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/MediaView/style.less' },
      { type: 'text', url: 'views/MediaView/template.html' }
    ]);
    this.humanLabel = 'Media Data Details';
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

class MediaResponseEtsView extends MediaResponseDasView {
  constructor (div) {
    super(div);
    this.responseType = 'etsResponse';
  }
}
export { MediaResponseDasView, MediaResponseEtsView };
