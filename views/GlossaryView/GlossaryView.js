/* globals d3 */
import SurveyView from '../SurveyView/SurveyView.js';

class GlossaryView extends SurveyView {
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
          .attr('data-key', `terminology`)
          .attr('data-role', this.dataset.term)
          .classed('public', true)
          .attr('placeholder', 'Suggest an alternative');
      });
    super.collectKeyElements();
  }
  updateTerminology (terminology = {}) {
    this.d3el.selectAll('[data-term]').each(function () {
      const term = terminology[this.dataset.term] || this.dataset.term;
      d3.select(this).select('h3').text(term);
    });
    d3.selectAll('.inspectable').each(function () {
      this.innerText = terminology[this.dataset.term] || this.dataset.term;
    });
  }
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
  isEnabled () {
    return true;
  }
  validateForm (formValues) {
    if (formValues.terminolgy) {
      for (const [term, value] of Object.entries(formValues.terminology)) {
        if (!value) {
          delete formValues.terminolgy[term];
        }
      }
    }

    return {
      valid: true,
      invalidIds: {}
    };
  }
}

export default GlossaryView;
