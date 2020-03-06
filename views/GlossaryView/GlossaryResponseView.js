/* globals d3 */
import VisView from '../VisView/VisView.js';

class GlossaryResponseView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'text', url: 'docs/glossary.html' },
      { type: 'less', url: 'views/GlossaryView/style.less' }
    ]);
    this.humanLabel = 'Glossary';
  }
  setup () {
    this.d3el.html(this.resources[0]);
    this.d3el.selectAll('[data-term]').each(function () {
      const element = d3.select(this);
      /* element.append('div')
        .classed('terminologyContainer', true)
        .attr('data-key', this.dataset.key);
      element.append('hr'); */
    });
    super.setup();
  }
}
export default GlossaryResponseView;
