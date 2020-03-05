/* globals d3 */
import VisView from '../VisView/VisView.js';
import SingletonFilter from '../../filters/SingletonFilter.js';

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
      .filter(transition => {
        return transition[this.responseType] !== null &&
          transition[this.responseType].exampleTableData;
      });
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
      window.controller.toggleFilter(new SingletonFilter({
        transitionId: d.transitionId,
        responseType: this.responseType,
        key: 'exampleTableData'
      }));
    });

    const humanResponseType = window.controller.getHumanResponseType(this.responseType);
    const isFilterTarget = window.controller.lookupFilter(`Specific response, filtered from ${humanResponseType}[exampleTableData]`) !== -1;
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
    return transition.etsResponse !== null &&
      transition.etsResponse.targetType === 'tabular';
  }
}
export { TablesResponseDasView, TablesResponseEtsView };
