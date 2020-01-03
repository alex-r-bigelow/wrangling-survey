import VisView from '../VisView/VisView.js';

class TextualResponseDasView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/TextualView/style.less' },
      { type: 'text', url: 'views/TextualView/template.html' }
    ]);
    this.humanLabel = 'Textual Data Details';
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

class TextualResponseEtsView extends TextualResponseDasView {
  constructor (div) {
    super(div);
    this.responseType = 'etsResponse';
  }
}
export { TextualResponseDasView, TextualResponseEtsView };
