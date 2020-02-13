import VisView from '../VisView/VisView.js';

class TextualResponseDasView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/TextualView/style.less' },
      { type: 'text', url: 'views/TextualView/template.html' }
    ]);
    this.humanLabel = 'Initial Textual Data Details';
    this.responseType = 'dasResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
  }
  filterTransition (transition) {
    return transition.dasResponse.textualThinking !== 'Never';
  }
}

class TextualResponseEtsView extends TextualResponseDasView {
  constructor (div) {
    super(div);
    this.humanLabel = 'Alternative Textual Data Details';
    this.responseType = 'etsResponse';
  }
  filterTransition (transition) {
    return transition.etsResponse !== null &&
      transition.etsResponse.targetType === 'textual';
  }
}
export { TextualResponseDasView, TextualResponseEtsView };
