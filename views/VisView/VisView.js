/* globals d3 */
import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';
import Filter from '../../models/Filter.js';

class VisView extends IntrospectableMixin(View) {
  constructor (div, resourceList = []) {
    super(div, resourceList);
    this.keyElements = [];
    this.protesting = false;
    this.wrongWay = false;
    this.on('open', () => {
      let header = this.d3el.node();
      header = header && d3.select(header.parentNode).select('summary').node();
      if (header) {
        header.scrollIntoView();
      }
    });
  }
  get className () {
    return this.type;
  }
  setup () {
    this.setupLikertBarCharts();
    this.replaceTextFields();
  }
  setupLikertBarCharts () {
    const self = this;
    this.d3el.selectAll('[data-likert]').each(function () {
      const scale = this.dataset.likert.split(',');

      let likertChunks = d3.select(this).selectAll('.likertChunk').data(scale);
      likertChunks.exit().remove();
      const likertChunksEnter = likertChunks.enter().append('div')
        .classed('likertChunk', true);
      likertChunks = likertChunks.merge(likertChunksEnter);

      const barDivEnter = likertChunksEnter.append('div')
        .classed('bar', true);
      barDivEnter.append('div')
        .classed('all', true);
      barDivEnter.append('div')
        .classed('filtered', true);

      likertChunksEnter.append('input')
        .attr('type', 'checkbox')
        .attr('name', d => this.dataset.key)
        .attr('id', d => this.dataset.key + d.replace(/\s/g, ''))
        .attr('value', d => d)
        .property('checked', true)
        .on('change', d => {
          window.controller.toggleFilter(new Filter({
            humanLabel: `${self.responseType}[${this.dataset.key}] != ${d}`,
            test: transition => transition[self.responseType][this.dataset.key] !== d
          }));
        });
      likertChunksEnter.append('label')
        .attr('for', d => this.dataset.key + d.replace(/\s/g, ''))
        .text(d => d);
    });
  }
  replaceTextFields () {
    this.d3el.selectAll('textarea, input[type="text"]').each(function () {
      const key = this.dataset.key;
      // Replace the textarea / input element with a div
      d3.select(this).classed('tempInsertionFlag');
      d3.select(this.parentNode).insert('div', '.tempInsertionFlag')
        .classed('textResponseContainer', true)
        .attr('data-key', key);
      d3.select(this).remove();
    });
  }
  draw () {
    const fullList = window.controller.transitionList;
    const filteredList = window.controller.getFilteredTransitionList();
    this.drawLikertBarCharts(fullList, filteredList);
    this.drawTextFields(fullList, filteredList);
  }
  countUniqueValues (fullList, filteredList, key) {
    const allCounts = {};
    const filteredCounts = {};
    for (const transition of fullList) {
      const value = transition[this.responseType][key];
      allCounts[value] = allCounts[value] || 0;
      allCounts[value] += 1;
    }
    for (const transition of filteredList) {
      const value = transition[this.responseType][key];
      filteredCounts[value] = filteredCounts[value] || 0;
      filteredCounts[value] += 1;
    }
    return { allCounts, filteredCounts };
  }
  drawLikertBarCharts (fullList, filteredList) {
    const self = this;
    this.d3el.selectAll('[data-likert]').each(function () {
      const key = this.dataset.key;
      const { allCounts, filteredCounts } = self.countUniqueValues(fullList, filteredList, key);
      const maxCount = d3.max(Object.values(allCounts));
      d3.select(this).selectAll('.likertChunk').each(function (d) {
        const allCount = allCounts[d] || 0;
        const allPercent = maxCount === undefined ? 0 : 100 * allCount / maxCount;
        const filteredCount = filteredCounts[d] || 0;
        const filteredPercent = maxCount === undefined ? 0 : 100 * filteredCount / maxCount;
        const filterHumanLabel = `${self.responseType}[${key}] != ${d}`;
        const likertChunk = d3.select(this);
        likertChunk.select('label')
          .text(`(${filteredCount}/${allCount}) ${d}`);
        likertChunk.select('input')
          .property('checked', window.controller.filterLabelIndex(filterHumanLabel) === -1);
        likertChunk.select('.bar .all')
          .style('width', `${allPercent}%`);
        likertChunk.select('.bar .filtered')
          .style('width', `${filteredPercent}%`);
      });
    });
  }
  drawTextFields (fullList, filteredList) {
    const self = this;
    this.d3el.selectAll('.textResponseContainer').each(function () {
      const { allCounts, filteredCounts } = self.countUniqueValues(fullList, filteredList, this.dataset.key);
      const responseList = Object.keys(filteredCounts).sort((a, b) => filteredCounts[b] - filteredCounts[a]);

      const container = d3.select(this);
      const filterIndex = window.controller.findFilter(filterObj => {
        return filterObj.humanLabel.startsWith(`${self.responseType}[${this.dataset.key}] = `);
      });
      container.classed('filterTarget', filterIndex !== -1);

      let responses = container.selectAll('.response')
        .data(responseList, d => d);
      responses.exit().remove();
      const responsesEnter = responses.enter().append('div')
        .classed('response', true)
        .on('click', d => {
          const actualValue = d === 'undefined' ? undefined
            : d === 'null' ? null : d;
          const displayValue = d === '' ? '(blank)' : d;
          window.controller.toggleFilter(new Filter({
            humanLabel: `${self.responseType}[${this.dataset.key}] = ${displayValue}`,
            test: transition => transition[self.responseType][this.dataset.key] === actualValue
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
  isVisible () {
    console.warn(`isVisible not implemented for ${this.type}`);
  }
}
export default VisView;
