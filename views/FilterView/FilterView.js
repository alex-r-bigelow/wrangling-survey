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
    const focused = !this.d3el.classed('unfocused');
    const button = this.d3el.select('.collapse.button')
      .classed('imgAndLabel', focused);
    button.select('.label')
      .style('display', focused ? null : 'none');
    button.select('img')
      .attr('src', focused ? 'img/collapse.svg' : 'img/expand.svg');
  }
  show () {
    this.d3el.classed('unfocused', false);
    d3.select('.vis.pageSlice').classed('unfocused', true);
    this.render();
  }
  hide () {
    this.d3el.classed('unfocused', true);
    d3.select('.vis.pageSlice').classed('unfocused', false);
  }
  isVisible () {
    return true;
  }
}

export default FilterView;
