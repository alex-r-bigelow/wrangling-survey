/* globals d3 */
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

    const datasetLabelField = d3.select(this.d3el.select('[data-key="datasetLabel"]')
      .node().parentNode);
    datasetLabelField.append('div')
      .classed('errata', true)
      .text(`Note that this input field displayed as a select menu on some
devices, and the suggested dataset labels may have appeared as a limited-choice
dropdown for some participants.`);
  }
}
export default DomainResponseView;
