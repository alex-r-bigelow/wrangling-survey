/* globals d3 */
import VisView from '../VisView/VisView.js';
import TermFilter from '../../filters/TermFilter.js';

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
    this.d3el.insert('div', ':first-child')
      .classed('glossaryErrorWarning', true)
      .text(`Please be advised that, due to interaction difficulties and technical differences across devices, many participants did not see this section, and some responses may have been lost.`);
    this.d3el.selectAll('[data-term]').each(function () {
      const element = d3.select(this);
      element.insert('h3', ':first-child')
        .text(this.dataset.term);
      const wordField = element.append('div')
        .classed('field', true);
      wordField.append('p')
        .text('Suggest an alternate word');
      wordField.append('div')
        .classed('terminology', true)
        .classed('textResponseContainer', true);
      const defField = element.append('div')
        .classed('field', true);
      defField.append('p')
        .text('Suggest an alternate definition');
      defField.append('div')
        .classed('alternateDefinitions', true)
        .classed('textResponseContainer', true);
      element.append('hr');
    });
    super.setup();
  }
  setupViewFilter () {
    // Overriding no-op; the view filter doesn't really make sense for the glossary
  }
  drawViewFilter () {
    // Overriding no-op; the view filter doesn't really make sense for the glossary
  }
  draw () {
    const { fullList, filteredList } = this.getTransitionLists();

    this.drawTermFields(fullList, filteredList, 'terminology');
    this.drawTermFields(fullList, filteredList, 'alternateDefinitions');
  }
  combineDicts (transitionList, key) {
    return transitionList.map(transition => {
      const combined = {};
      Object.assign(combined,
        transition.dasResponse[key] || {},
        (transition.etsResponse && transition.etsResponse[key]) || {});
      return combined;
    });
  }
  countUniqueValues (fullList, filteredList, term) {
    const countValues = transitionList => {
      const counts = {};
      for (const transition of transitionList) {
        let value = transition[term] === undefined
          ? 'undefined' : transition[term];
        counts[value] = (counts[value] || 0) + 1;
      }
      return counts;
    };
    return {
      allCounts: countValues(fullList),
      filteredCounts: countValues(filteredList)
    };
  }
  drawTermFields (fullList, filteredList, key) {
    const self = this;
    this.d3el.selectAll('[data-term]').each(function () {
      const { allCounts, filteredCounts } = self.countUniqueValues(
        self.combineDicts(fullList, key),
        self.combineDicts(filteredList, key),
        this.dataset.term);
      const responseList = Object.keys(filteredCounts).sort((a, b) => filteredCounts[b] - filteredCounts[a]);

      const container = d3.select(this).select(`.${key}`);
      const filterIndex = window.controller.findFilter(filterObj => {
        return filterObj.humanLabel.startsWith(`${key}[${this.dataset.term}] == `);
      });
      container.classed('filterTarget', filterIndex !== -1);

      let responses = container.selectAll('.response')
        .data(responseList, d => d);
      responses.exit().remove();
      const responsesEnter = responses.enter().append('div')
        .classed('response', true)
        .on('click', d => {
          window.controller.toggleFilter(new TermFilter({
            key,
            term: this.dataset.term,
            value: d === 'undefined' ? undefined : d === 'null' ? null : d
          }));
        });
      responses = responses.merge(responsesEnter);

      responsesEnter.append('div')
        .classed('badge', true);
      responses.select('.badge')
        .text(d => `${filteredCounts[d]} / ${allCounts[d]}`);

      responsesEnter.append('div')
        .classed('text', true)
        .text(d => d === '' ? '(blank)' : d);
    });
  }
}
export default GlossaryResponseView;
