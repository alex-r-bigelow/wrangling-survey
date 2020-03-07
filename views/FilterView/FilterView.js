import VisView from '../VisView/VisView.js';

class FilterView extends VisView {
  constructor (div) {
    super(div, [
      { type: 'text', url: 'views/FilterView/template.html' },
      { type: 'less', url: 'views/FilterView/style.less' }
    ]);
    this.humanLabel = 'Active Filters';
    this.terms = {};
    this._connectedTerms = false;
  }
  setup () {
    this.d3el.html(this.resources[0]);
    this.headerEl.append('div').classed('filterCount', true);
  }
  draw () {
    const filterList = window.controller.filterList;
    this.headerEl.select('.filterCount')
      .text(`(${filterList.length})`);

    this.d3el.select('.noFilters')
      .style('display', filterList.length > 0 ? 'none' : null);

    let filters = this.d3el.select('.filterList').selectAll('.filter')
      .data(filterList, d => d.humanLabel);
    filters.exit().remove();
    const filtersEnter = filters.enter().append('div')
      .classed('filter', true);
    filters = filters.merge(filtersEnter);

    filtersEnter.append('label')
      .text(d => d.humanLabel);

    filtersEnter.append('div')
      .classed('button', true)
      .classed('imgAndLabel', true)
      .append('a')
      .append('img')
      .attr('src', 'img/trash.svg');
    filtersEnter.select('.button')
      .append('div')
      .classed('label', true)
      .text('Remove');
    filters.select('.button')
      .on('click', (d, i) => { window.controller.removeFilter(i); });
  }
  isVisible () {
    return true;
  }
}

export default FilterView;
