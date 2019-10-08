/* globals d3, pluralize */
import SurveyView from '../SurveyView/SurveyView.js';

class GlossaryView extends SurveyView {
  constructor () {
    super(d3.select('.GlossaryView'), [
      { type: 'text', url: 'views/GlossaryView/template.html' },
      { type: 'text', url: 'docs/glossary.html' },
      { type: 'json', url: 'views/GlossaryView/pluralDictionary.json' },
      { type: 'less', url: 'views/GlossaryView/style.less' }
    ]);
    this.terms = {};
    this._connectedTerms = false;
  }
  setup () {
    const self = this;
    this.d3el.html(this.resources[0]);
    this.d3el.select('.content').html(this.resources[1])
      .selectAll('[data-term]').each(function () {
        self.terms[this.dataset.term] = this;
        const element = d3.select(this);
        element.insert('input', ':first-child')
          .attr('type', 'text')
          .attr('data-key', `terminology`)
          .attr('data-role', this.dataset.term)
          .classed('public', true)
          .attr('placeholder', 'Suggest an alternate word');
        element.insert('h3', ':first-child')
          .text(this.dataset.term);
      });
    // Add the plural dictionary
    for (const [regex, replace] of Object.entries(this.resources[2].plural)) {
      pluralize.addPluralRule(new window.RexExp(regex), replace);
    }
    for (const [regex, replace] of Object.entries(this.resources[2].singular)) {
      pluralize.addSingularRule(new window.RexExp(regex), replace);
    }
    for (const term of this.resources[2].uncountable) {
      pluralize.addUncountableRule(term);
    }
    for (const [singular, plural] of Object.entries(this.resources[2].irregular)) {
      pluralize.addIrregularRule(singular, plural);
    }
    super.collectKeyElements();
  }
  connectTerminology () {
    // Attach event listeners to inspectable fields, and keep the original term
    // for replacement
    const self = this;
    d3.selectAll('.inspectable')
      .attr('data-term', function () { return pluralize.singular(this.innerText.toLocaleLowerCase()); })
      .attr('data-pluralize', function () { return pluralize.isPlural(this.innerText) && 'true'; })
      .attr('data-capitalize', function () { return this.innerText.match(/^[A-Z]/) && 'true'; })
      .on('click', function () {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        self.show(this.dataset.term);
      }).on('touchend', function () {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        self.show(this.dataset.term);
      });
    this._connectedTerms = true;
  }
  updateTerminology (terminology = {}) {
    if (!this._connectedTerms) {
      this.connectTerminology();
    }
    this.d3el.selectAll('[data-term]').each(function () {
      const term = terminology[this.dataset.term] || this.dataset.term;
      d3.select(this).select('h3').text(term);
    });
    d3.selectAll('.inspectable').each(function () {
      this.innerText = terminology[this.dataset.term] || this.dataset.term;
      if (this.dataset.pluralize) {
        this.innerText = pluralize.plural(this.innerText);
      }
      if (this.dataset.capitalize) {
        this.innerText = this.innerText[0].toLocaleUpperCase() + this.innerText.slice(1);
      }
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
    if (formValues.terminology) {
      for (const [term, value] of Object.entries(formValues.terminology)) {
        if (!value) {
          delete formValues.terminology[term];
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
