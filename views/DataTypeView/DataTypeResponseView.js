import VisView from '../VisView/VisView.js';

class DataTypeResponseView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DataTypeView/style.less' },
      { type: 'text', url: 'views/DataTypeView/template.html' }
    ]);
    this.humanLabel = 'Initial Data Abstraction';
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
export default DataTypeResponseView;
