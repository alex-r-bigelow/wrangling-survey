/* globals d3, pluralize */
import SurveyView from '../SurveyView/SurveyView.js';

class GlossaryView extends SurveyView {
  constructor () {
    super(d3.select('.GlossaryView'), [
      { type: 'text', url: 'views/GlossaryView/template.html' },
      { type: 'text', url: 'docs/glossary.html' },
      { type: 'json', url: 'docs/pluralDictionary.json' },
      { type: 'less', url: 'views/GlossaryView/style.less' }
    ]);
    this.terms = {};
    this._connectedTerms = false;
  }
  isDisabled () {
    return !window.localStorage.getItem('enableGlossary');
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
        element.append('textarea')
          .attr('data-key', 'alternateDefinitions')
          .attr('data-role', this.dataset.term)
          .classed('public', true)
          .attr('placeholder', 'Suggest an alternate definition');
        element.append('hr');
      });
    const toggle = () => {
      if (this.isDisabled() || !this.d3el.classed('unfocused')) {
        this.hide();
      } else {
        this.show();
        d3.event.stopPropagation();
      }
      this.render();
    };
    this.d3el.select('.toggle.button').on('click', toggle);
    this.d3el.select('.collapse.button').on('click', toggle);
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
    this.collectKeyElements();
    this.connectTerminology();
    this.setupSurveyListeners();
  }
  draw () {
    const focused = !this.d3el.classed('unfocused');
    this.d3el.select('.collapse.button img')
      .attr('src', focused ? 'img/collapse.svg' : 'img/expand.svg');
    this.d3el.selectAll('.button')
      .classed('disabled', this.isDisabled());
  }
  collectTerminology () {
    // Attach event listeners to inspectable fields, and keep the original term
    // for replacement
    d3.selectAll('.inspectable')
      .attr('data-term', function () { return pluralize.singular((this.dataset.coreTerm || this.innerText).toLocaleLowerCase()); })
      .attr('data-pluralize', function () { return this.dataset.coreTerm || !pluralize.isPlural(this.innerText) ? null : 'true'; })
      .attr('data-capitalize', function () { return (this.dataset.coreTerm || this.innerText).match(/^[A-Z]/) ? 'true' : null; });
    this.connectTerminology();
    this._connectedTerms = true;
  }
  connectTerminology () {
    const self = this;
    let doubleTapTimeout = null;
    d3.selectAll('.inspectable')
      .on('dblclick.inspect', function () {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        self.show(this.dataset.term);
      }).on('touchend.inspect', function () {
        if (doubleTapTimeout !== null) {
          // Double tapped
          d3.event.preventDefault();
          d3.event.stopPropagation();
          window.clearTimeout(doubleTapTimeout);
          doubleTapTimeout = null;
          self.show(this.dataset.term);
        } else {
          // First tap...
          doubleTapTimeout = window.setTimeout(() => {
            // Didn't tap within 300ms
            window.clearTimeout(doubleTapTimeout);
            doubleTapTimeout = null;
          }, 300);
        }
      });
  }
  updateTerminology (terminology = {}) {
    if (!this._connectedTerms) {
      this.collectTerminology();
    }
    this.d3el.selectAll('[data-term]').each(function () {
      const term = terminology[this.dataset.term] || this.dataset.term;
      d3.select(this).select('h3').text(this.dataset.coreTerm || term);
    });
    d3.selectAll('.inspectable').each(function () {
      if (this.dataset.coreTerm) {
        return; // don't change something that deviates significantly enough from the coreTerm
      }
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
    this.d3el.classed('unfocused', false);
    d3.select('.survey.pageSlice').classed('unfocused', true);
    if (term) {
      term = term.toLocaleLowerCase();
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
    this.render();
  }
  hide () {
    this.d3el.classed('unfocused', true);
    d3.select('.survey.pageSlice').classed('unfocused', false);
  }
  isVisible () {
    return true;
  }
  validateForm (formValues) {
    if (formValues.terminology) {
      for (const [term, value] of Object.entries(formValues.terminology)) {
        if (value === '') {
          delete formValues.terminology[term];
        }
      }
      for (const [term, value] of Object.entries(formValues.alternateDefinitions)) {
        if (value === '') {
          delete formValues.alternateDefinitions[term];
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
