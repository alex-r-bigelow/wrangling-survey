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
  collectKeyElements () {
    this.keyElements = this.d3el.selectAll('[data-key]').nodes();
  }
  setupLikertFields () {
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
  drawLikertFields (fullList, filteredList) {
    const self = this;
    this.d3el.selectAll('[data-likert]').each(function () {
      const allCounts = {};
      const filteredCounts = {};
      for (const transition of fullList) {
        const value = transition[self.responseType][this.dataset.key];
        allCounts[value] = allCounts[value] || 0;
        allCounts[value] += 1;
      }
      for (const transition of filteredList) {
        const value = transition[self.responseType][this.dataset.key];
        filteredCounts[value] = filteredCounts[value] || 0;
        filteredCounts[value] += 1;
      }
      const maxCount = d3.max(Object.values(allCounts));
      d3.select(this).selectAll('.likertChunk').each(function (d) {
        const allCount = allCounts[d] || 0;
        const allPercent = maxCount === undefined ? 0 : 100 * allCount / maxCount;
        const filteredCount = filteredCounts[d] || 0;
        const filteredPercent = maxCount === undefined ? 0 : 100 * filteredCount / maxCount;
        const likertChunk = d3.select(this);
        likertChunk.select('label')
          .text(`(${filteredCount}/${allCount}) ${d}`);
        likertChunk.select('.bar .all')
          .style('width', `${allPercent}%`);
        likertChunk.select('.bar .filtered')
          .style('width', `${filteredPercent}%`);
      });
    });
  }
  setupProtest () {
    // TODO
  }
  draw () {
    const filteredList = window.controller.getFilteredTransitionList();
    this.drawLikertFields(window.controller.transitionList, filteredList);
  }
  isVisible () {
    console.warn(`isVisible not implemented for ${this.type}`);
  }
}
export default VisView;
