/* globals d3 */
import VisView from '../VisView/VisView.js';
import Filter from '../../models/Filter.js';

class TablesResponseDasView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/TablesView/style.less' },
      { type: 'text', url: 'views/TablesView/template.html' },
      { type: 'text', url: 'views/TablesView/responseTableTemplate.html' }
    ]);
    this.humanLabel = 'Initial Tabular Data Details';
    this.responseType = 'dasResponse';
  }
  setup () {
    this.d3el.html(this.resources[1]);
    super.setup();

    // Empty out the table input fields; we'll draw these differently
    this.d3el.select('.exampleTableData').html('');
  }
  draw () {
    super.draw();
    const filteredList = window.controller.getFilteredTransitionList()
      .filter(transition => !!transition[this.responseType].exampleTableData);
    this.drawTables(filteredList);
  }
  drawTables (filteredList) {
    const container = this.d3el.select('.exampleTableData');
    let tableResponses = container.selectAll('.tableResponse')
      .data(filteredList, d => d.transitionId);
    tableResponses.exit().remove();
    const tableResponsesEnter = tableResponses.enter().append('div')
      .classed('tableResponse', true)
      .html(this.resources[2]);
    tableResponses = tableResponses.merge(tableResponsesEnter);

    const self = this;
    tableResponses.selectAll(':scope [data-role]')
      .data(function (d) {
        return d3.select(this).selectAll(':scope [data-role]').nodes()
          .map(node => d[self.responseType].exampleTableData[node.dataset.role]);
      })
      .text(d => d === '' ? '(blank)' : d)
      .classed('blank', d => d === '');

    tableResponsesEnter.on('click', d => {
      if (this.responseType === 'dasResponse') {
        window.controller.toggleFilter(new Filter({
          humanLabel: `Only show interpretations of (tabular) ${d.dasResponse.datasetLabel}`,
          test: transition => transition.dasResponse.browserId === d.dasResponse.browserId &&
            transition.dasResponse.submitTimestamp === d.dasResponse.submitTimestamp
        }));
      } else {
        window.controller.toggleFilter(new Filter({
          humanLabel: `Only show tabular interpretation of ${d.dasResponse.datasetLabel}`,
          test: transition => transition.transitionId === d.transitionId
        }));
      }
    });

    let isFilterTarget;
    if (this.responseType === 'dasResponse') {
      isFilterTarget = window.controller.findFilter(filterObj => {
        return filterObj.humanLabel.startsWith(`Only show interpretations of (tabular) `);
      }) !== -1;
    } else {
      isFilterTarget = window.controller.findFilter(filterObj => {
        return filterObj.humanLabel.startsWith(`Only show tabular interpretation of `);
      }) !== -1;
    }
    container.classed('filterTarget', isFilterTarget);
  }
  filterTransition (transition) {
    return transition.dasResponse.tabularThinking !== 'Never';
  }
}

class TablesResponseEtsView extends TablesResponseDasView {
  constructor (div) {
    super(div);
    this.humanLabel = 'Alternative Tabular Data Details';
    this.responseType = 'etsResponse';
  }
  filterTransition (transition) {
    return transition.etsResponse.targetType === 'tabular';
  }
}
export { TablesResponseDasView, TablesResponseEtsView };
