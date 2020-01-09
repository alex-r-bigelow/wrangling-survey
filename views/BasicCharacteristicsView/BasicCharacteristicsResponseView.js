import VisView from '../VisView/VisView.js';

class BasicCharacteristicsResponseView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/BasicCharacteristicsView/style.less' },
      { type: 'text', url: 'views/BasicCharacteristicsView/template.html' }
    ]);
    this.humanLabel = 'Basic Dataset Characteristics';
    this.responseType = 'dasResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();
  }
}
export default BasicCharacteristicsResponseView;
