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
    this.barId = 1;
  }
  get className () {
    return this.type;
  }
  setup () {
    this.setupLikertBarCharts();
    this.replaceTextFields();
    this.setupFlagCheckboxes();
    this.setupDataCheckedValues();
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
          const filterStates = [
            new Filter({
              humanLabel: `${self.responseType}[${this.dataset.key}] != ${d}`,
              test: transition => transition[self.responseType][this.dataset.key] !== d
            }),
            new Filter({
              humanLabel: `${self.responseType}[${this.dataset.key}] = ${d}`,
              test: transition => transition[self.responseType][this.dataset.key] === d
            })
          ];
          window.controller.rotateFilterState(filterStates);
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
  setupFlagCheckboxes () {
    const self = this;
    this.d3el.selectAll('.flagErrorWarning').style('display', null);
    this.d3el.selectAll('[type="checkbox"][data-flag]').each(function () {
      this.dataset.barId = `insertedBar${self.barId}`;
      self.barId += 1;
      this.dataset.originalLabel = self.d3el.select(`[for="${this.getAttribute('id')}"]`).text();
      const bar = d3.select(this.parentNode)
        .insert('div', `[data-flag="${this.dataset.flag}"]`)
        .attr('id', this.dataset.barId)
        .classed('bar', true);
      bar.append('div').classed('all', true);
      bar.append('div').classed('filtered', true);

      const filterStates = [
        new Filter({
          humanLabel: `${this.dataset.flag} not in ${self.responseType}[${this.dataset.key}]`,
          test: transition => {
            const responses = transition[self.responseType][this.dataset.key] || [];
            if (!(responses instanceof Array)) {
              // There was a bug in the first version of the survey that stored / overrode strings
              return responses !== this.dataset.flag;
            }
            return responses.indexOf(this.dataset.flag) === -1;
          }
        }),
        new Filter({
          humanLabel: `${this.dataset.flag} in ${self.responseType}[${this.dataset.key}]`,
          test: transition => {
            const responses = transition[self.responseType][this.dataset.key] || [];
            if (!(responses instanceof Array)) {
              // There was a bug in the first version of the survey that stored / overrode strings
              return responses === this.dataset.flag;
            }
            return responses.indexOf(this.dataset.flag) !== -1;
          }
        })
      ];
      d3.select(this).on('change', () => {
        window.controller.rotateFilterState(filterStates);
      });
    });
  }
  setupDataCheckedValues () {
    const self = this;
    this.d3el.selectAll('[type="checkbox"][data-checked-value]').each(function () {
      this.dataset.barId = `insertedBar${self.barId}`;
      self.barId += 1;
      this.dataset.originalLabel = self.d3el.select(`[for="${this.getAttribute('id')}"]`).text();
      const bar = d3.select(this.parentNode)
        .insert('div', `[data-flag="${this.dataset.flag}"]`)
        .attr('id', this.dataset.barId)
        .classed('bar', true);
      bar.append('div').classed('all', true);
      bar.append('div').classed('filtered', true);

      const filterStates = [
        new Filter({
          humanLabel: `Did not check ${this.dataset.checkedValue} for ${this.dataset.key}`,
          test: transition => {
            return transition[self.responseType][this.dataset.key] === this.dataset.flag;
          }
        }),
        new Filter({
          humanLabel: `Checked ${this.dataset.checkedValue} for ${this.dataset.key}`,
          test: transition => {
            return transition[self.responseType][this.dataset.key] === this.dataset.flag;
          }
        })
      ];
      d3.select(this).on('change', () => {
        window.controller.rotateFilterState(filterStates);
      });
    });
  }
  draw () {
    const fullList = window.controller.transitionList;
    const filteredList = window.controller.getFilteredTransitionList();
    this.maxCount = 0;
    this.drawLikertBarCharts(fullList, filteredList);
    this.drawTextFields(fullList, filteredList);
    this.drawFlagCheckboxes(fullList, filteredList);
    this.drawDataCheckedValues(fullList, filteredList);
    this.updateAllBars();
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
      self.maxCount = Math.max(self.maxCount, d3.max(Object.values(allCounts)) || 0);
      d3.select(this).selectAll('.likertChunk').each(function (d) {
        const allCount = allCounts[d] || 0;
        const filteredCount = filteredCounts[d] || 0;
        const filterBaseLabel = `${self.responseType}[${key}]`;
        const excludeFilterExists = window.controller.filterLabelIndex(`${filterBaseLabel} != ${d}`) !== -1;
        const includeFilterExists = window.controller.filterLabelIndex(`${filterBaseLabel} = ${d}`) !== -1;
        const likertChunk = d3.select(this);
        likertChunk.select('label')
          .text(`(${filteredCount}/${allCount}) ${d}`);
        likertChunk.select('input')
          .property('checked', !excludeFilterExists)
          .property('indeterminate', !excludeFilterExists && !includeFilterExists);
        likertChunk.select('.bar .all').node().dataset.count = allCount;
        likertChunk.select('.bar .filtered').node().dataset.count = filteredCount;
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
  drawFlagCheckboxes (fullList, filteredList) {
    const self = this;
    this.d3el.selectAll('[type="checkbox"][data-flag]').each(function () {
      const countFlags = (count, transition) => {
        const flags = transition[self.responseType][this.dataset.key] || [];
        const increment = flags.indexOf(this.dataset.flag) === -1 ? 0 : 1;
        return count + increment;
      };
      const allCount = fullList.reduce(countFlags, 0);
      self.maxCount = Math.max(self.maxCount, allCount);
      const filteredCount = filteredList.reduce(countFlags, 0);
      self.d3el.select(`[for="${this.getAttribute('id')}"]`)
        .text(`(${filteredCount}/${allCount}) ${this.dataset.originalLabel}`);
      const bar = self.d3el.select(`#${this.dataset.barId}`);
      bar.select('.all').node().dataset.count = allCount;
      bar.select('.filtered').node().dataset.count = filteredCount;

      const filterBaseLabel = `${self.responseType}[${this.dataset.key}]`;
      const excludeFilterExists = window.controller.filterLabelIndex(`${this.dataset.flag} not in ${filterBaseLabel}`) !== -1;
      const includeFilterExists = window.controller.filterLabelIndex(`${this.dataset.flag} in ${filterBaseLabel}`) !== -1;
      d3.select(this)
        .property('checked', !excludeFilterExists)
        .property('indeterminate', !excludeFilterExists && !includeFilterExists);
    });
  }
  drawDataCheckedValues (fullList, filteredList) {
    const self = this;
    this.d3el.selectAll('[type="checkbox"][data-checked-value]').each(function () {
      const countChecks = (count, transition) => {
        const match = transition[self.responseType][this.dataset.key] === this.dataset.checkedValue;
        const increment = match ? 0 : 1;
        return count + increment;
      };
      const allCount = fullList.reduce(countChecks, 0);
      self.maxCount = Math.max(self.maxCount, allCount);
      const filteredCount = filteredList.reduce(countChecks, 0);
      self.d3el.select(`[for="${this.getAttribute('id')}"]`)
        .text(`(${filteredCount}/${allCount}) ${this.dataset.originalLabel}`);
      const bar = self.d3el.select(`#${this.dataset.barId}`);
      bar.select('.all').node().dataset.count = allCount;
      bar.select('.filtered').node().dataset.count = filteredCount;

      const filterBaseLabel = `${self.responseType}[${this.dataset.key}]`;
      const excludeFilterExists = window.controller.filterLabelIndex(`${filterBaseLabel} != ${this.dataset.checkedValue}`) !== -1;
      const includeFilterExists = window.controller.filterLabelIndex(`${filterBaseLabel} == ${this.dataset.checkedValue}`) !== -1;
      d3.select(this)
        .property('checked', !excludeFilterExists)
        .property('indeterminate', !excludeFilterExists && !includeFilterExists);
    });
  }
  updateAllBars () {
    const self = this;
    this.d3el.selectAll('.bar .all, .bar .filtered').each(function () {
      d3.select(this).style('width', `${100 * this.dataset.count / self.maxCount}%`);
    });
  }
  isVisible () {
    console.warn(`isVisible not implemented for ${this.type}`);
  }
}
export default VisView;
