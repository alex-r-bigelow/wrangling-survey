import VisView from '../VisView/VisView.js';

class MediaResponseDasView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/MediaView/style.less' },
      { type: 'text', url: 'views/MediaView/template.html' }
    ]);
    this.humanLabel = 'Initial Media Data Details';
    this.responseType = 'dasResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
  }
  filterTransition (transition) {
    return transition.dasResponse.mediaThinking !== 'Never';
  }
}

class MediaResponseEtsView extends MediaResponseDasView {
  constructor (div) {
    super(div);
    this.humanLabel = 'Alternative Media Data Details';
    this.responseType = 'etsResponse';
  }
  filterTransition (transition) {
    return transition.etsResponse !== null &&
      transition.etsResponse.targetType === 'media';
  }
}
export { MediaResponseDasView, MediaResponseEtsView };
