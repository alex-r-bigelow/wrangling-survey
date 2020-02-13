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
  get humanResponseType () {
    if (this.responseType === 'dasResponse') {
      return 'Initial Abstraction';
    } else if (this.responseType === 'etsResponse') {
      return 'Alternative Abstraction';
    }
  }
  setup () {
    this.setupLikertBarCharts();
    this.replaceTextFields();
    this.replaceProtestButtons();
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
              humanLabel: `${self.humanResponseType}[${this.dataset.key}] != ${d}`,
              test: transition => {
                if (self.responseType === undefined) {
                  // This view isn't associated to a specific response type;
                  // check both types in the transition
                  return transition.dasResponse[this.dataset.key] !== d &&
                    transition.etsResponse[this.dataset.key] !== d;
                } else {
                  return transition[self.responseType][this.dataset.key] !== d;
                }
              }
            }),
            new Filter({
              humanLabel: `${self.humanResponseType}[${this.dataset.key}] = ${d}`,
              test: transition => {
                if (self.responseType === undefined) {
                  // This view isn't associated to a specific response type;
                  // check both types in the transition
                  return transition.dasResponse[this.dataset.key] === d &&
                    transition.etsResponse[this.dataset.key] === d;
                } else {
                  return transition[self.responseType][this.dataset.key] === d;
                }
              }
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
  replaceProtestButtons () {
    let viewName = this.type.match(/(.*)Response/);
    viewName = viewName && viewName[1] + 'View';

    const wrongWayButton = this.d3el.select('.wrongWay.button');
    if (wrongWayButton.size() > 0) {
      // Remove the button
      wrongWayButton.remove();
      // Add a div for descriptions inside the .wrongWay.field
      const parent = this.d3el.select('.wrongWay.field').node().parentNode;
      d3.select(parent).insert('div', '.wrongWay.field + *')
        .classed('textResponseContainer', true)
        .attr('data-key', viewName + 'WrongWay');
    }

    const protestButton = this.d3el.select('.protest.button');
    if (protestButton.size() > 0) {
      // Remove the button and the restore button
      protestButton.remove();
      this.d3el.select('.restore.button').remove();
      // Add a helper label so we even know what this field is:
      this.d3el.insert('p', '.buttonContainer')
        .text('Responses from participants that chose to "Skip this section":');
      // Add a div before the .buttonContainer, with a little extra space
      this.d3el.insert('div', '.buttonContainer')
        .classed('textResponseContainer', true)
        .attr('data-key', viewName + 'Protest')
        .style('margin-bottom', '1em');
    }
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
          humanLabel: `${this.dataset.flag} not in ${self.humanResponseType}[${this.dataset.key}]`,
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
          humanLabel: `${this.dataset.flag} in ${self.humanResponseType}[${this.dataset.key}]`,
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
  getTransitionLists () {
    const filterFunc = transition => this.filterTransition(transition);
    return {
      fullList: window.controller.transitionList
        .filter(filterFunc),
      filteredList: window.controller.getFilteredTransitionList()
        .filter(filterFunc)
    };
  }
  filterTransition (transition) {
    return true;
  }
  draw () {
    const { fullList, filteredList } = this.getTransitionLists();
    this.updateFilterIndicators(fullList, filteredList);
    this.maxCount = 0;
    this.drawLikertBarCharts(fullList, filteredList);
    this.drawTextFields(fullList, filteredList);
    this.drawFlagCheckboxes(fullList, filteredList);
    this.drawDataCheckedValues(fullList, filteredList);
    this.updateAllBars();
  }
  updateFilterIndicators (fullList, filteredList) {
    d3.select(this.d3el.node().parentNode).select('.filterIndicators')
      .text(`${filteredList.length} / ${fullList.length}`);
  }
  countUniqueValues (fullList, filteredList, key) {
    const countValues = transitionList => {
      const counts = {};
      const alreadyCountedDasResponses = {};
      for (const transition of fullList) {
        let value = 'undefined';
        let increment = 1;
        if (this.responseType === undefined) {
          if (transition.dasResponse.hasOwnProperty(key)) {
            const dasResponseId = transition.dasResponse.browserId +
              transition.dasResponse.submitTimestamp;
            if (alreadyCountedDasResponses[dasResponseId]) {
              increment = 0;
            } else {
              alreadyCountedDasResponses[dasResponseId] = true;
            }
            value = transition.dasResponse[key];
          } else if (transition.etsResponse.hasOwnProperty(key)) {
            value = transition.dasResponse[key];
          }
        } else {
          value = transition[this.responseType][key];
        }
        counts[value] = (counts[value] || 0) + increment;
      }
      return counts;
    };
    return {
      allCounts: countValues(fullList),
      filteredCounts: countValues(filteredList)
    };
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
        const filterBaseLabel = `${self.humanResponseType}[${key}]`;
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
  isDisabled () {
    return this.getTransitionLists().filteredList.length === 0;
  }
}
export default VisView;
