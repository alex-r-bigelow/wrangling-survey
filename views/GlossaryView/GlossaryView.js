/* globals d3 */
import { View } from '../../node_modules/uki/dist/uki.esm.js';

class GlossaryView extends View {
  constructor () {
    super(d3.select('.GlossaryView'), [
      { type: 'text', url: 'views/GlossaryView/template.html' },
      { type: 'text', url: 'docs/glossary.html' },
      { type: 'less', url: 'views/GlossaryView/style.less' }
    ]);
    this.terms = {};
  }
  setup () {
    const self = this;
    this.d3el.html(this.resources[0]);
    this.d3el.select('.content').html(this.resources[1])
      .selectAll('[data-term]').each(function () {
        self.terms[this.dataset.term] = this;
        const element = d3.select(this);
        element.insert('h3', ':first-child')
          .text(this.dataset.term);
        element.append('div')
          .classed('field', true)
          .append('input')
          .attr('type', 'text')
          .classed('public', true)
          .attr('placeholder', 'Suggest an alternative');
      });
  }
  draw () {}
  show (term) {
    term = term.toLocaleLowerCase();
    window.controller.focusPane(this.d3el.node());
    this.d3el.select('details').attr('open', '');
    if (!this.terms[term]) {
      window.console.warn('No definition for term: ' + term);
    } else {
      this.terms[term].scrollIntoView();
      d3.select(this.terms[term])
        .transition().duration(1500)
        .styleTween('box-shadow', () => {
          let color = d3.interpolate('#002147', '#f7f7f7');
          return t => `0 0 0 6px #f7f7f7, 0 0 0 9px ${color(t)}`;
        });
    }
  }
}

export default GlossaryView;
