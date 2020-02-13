/* globals d3 */
import VisView from '../VisView/VisView.js';

class FilterView extends VisView {
  constructor () {
    super(d3.select('.FilterView'), [
      { type: 'text', url: 'views/FilterView/template.html' },
      { type: 'less', url: 'views/FilterView/style.less' }
    ]);
    this.terms = {};
    this._connectedTerms = false;
  }
  setup () {
    this.d3el.html(this.resources[0]);
    const toggle = () => {
      if (!this.d3el.classed('unfocused')) {
        this.hide();
      } else {
        this.show();
        d3.event.stopPropagation();
      }
      this.render();
    };
    this.d3el.select('.toggle.button').on('click', toggle);
    this.d3el.select('.collapse.button').on('click', toggle);
  }
  draw () {
    const filterList = window.controller.filterList;

    const focused = !this.d3el.classed('unfocused');
    const button = this.d3el.select('.collapse.button')
      .classed('imgAndLabel', focused);
    button.select('.label')
      .style('display', focused ? null : 'none');
    button.select('img')
      .attr('src', focused ? 'img/collapse.svg' : 'img/expand.svg');

    this.d3el.select('.toggle.button .filterCount')
      .text(filterList.length);

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
  show () {
    this.d3el.classed('unfocused', false);
    d3.select('.vis.pageSlice').classed('unfocused', true);
    this.render();
  }
  hide () {
    this.d3el.classed('unfocused', true);
    d3.select('.vis.pageSlice').classed('unfocused', false);
    this.render();
  }
  isVisible () {
    return true;
  }
}

export default FilterView;
