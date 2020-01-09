import VisView from '../VisView/VisView.js';

class DomainResponseView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DomainView/style.less' },
      { type: 'text', url: 'views/DomainView/template.html' }
    ]);
    this.humanLabel = 'Domain Characterization';
    this.responseType = 'dasResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
  }
}
export default DomainResponseView;
