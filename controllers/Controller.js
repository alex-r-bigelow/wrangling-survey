/* globals d3, less */
import { Model } from '../node_modules/uki/dist/uki.esm.js';
import Database from '../models/Database.js';

import recolorImageFilter from '../utils/recolorImageFilter.js';

class Controller extends Model {
  constructor () {
    super();
    this.currentViewIndex = 0;

    this.database = new Database();

    // detect IE8 and above, and edge
    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
      window.alert(this.msErrorText);
    }

    window.onresize = () => { this.renderAllViews(); };
    this.setupSidebar();

    (async () => {
      await Promise.all([
        this.setupViews(),
        less.pageLoadFinished,
        new Promise((resolve, reject) => {
          this.database.on('update', () => {
            resolve();
          });
        })
      ]);
      // Wait for LESS to finish loading before applying our SVG
      // filter hack
      recolorImageFilter();
      await this.finishSetup();
      d3.select('.spinner').style('display', 'none');
    })();
  }
  setupSidebar () {
    const sidebar = d3.select('.sidebar.pageSlice');
    sidebar.select('.collapse.button').on('click', () => {
      if (!sidebar.classed('unfocused')) {
        this.hideSidebar();
      } else {
        this.showSidebar();
      }
    });
  }
  async setupViewList (viewClassList, containerSelector) {
    const self = this;
    const views = viewClassList.map(View => new View());
    const sections = d3.select(`${containerSelector} .wrapper`)
      .selectAll('details')
      .data(views)
      .enter().append('details')
      .on('click', function () {
        if (d3.select(containerSelector).classed('unfocused')) {
          d3.selectAll('.pageSlice').classed('unfocused', true);
          d3.select(containerSelector).classed('unfocused', false);
          // We just toggled panes; make sure the thing we clicked on stays open
          this._keepOpen = true;
        }
      }).on('toggle', function (d, i) {
        if (this._keepOpen) {
          this.open = true;
          delete this._keepOpen;
        }
        if (containerSelector !== '.sidebar') {
          if (this.open) {
            self.advanceSection(i);
          }
        }
        self.renderAllViews();
      });
    const header = sections.append('summary')
      .each(function (d) { d.headerEl = d3.select(this); });
    header.append('div')
      .classed('title', true)
      .html(d => d.humanLabel);
    sections.append('div')
      .attr('class', d => d.className);
    await Promise.all(sections.nodes().map(async node => {
      const d3el = d3.select(node);
      const viewInstance = d3el.datum();
      // Assign DOM elements to each view, and ensure views create all their DOM
      // elements before returning
      await viewInstance.render(d3.select(node).select(`.${viewInstance.className}`));
    }));
    return views;
  }
  async renderAllViews () {
    const focused = !d3.select('.sidebar.pageSlice').classed('unfocused');
    const button = d3.select('.collapse.button')
      .classed('imgAndLabel', focused);
    button.select('.label')
      .style('display', focused ? null : 'none');
    button.select('img')
      .attr('src', focused ? 'img/collapse.svg' : 'img/expand.svg');
  }
  async showSidebar () {
    d3.selectAll('.pageSlice:not(.sidebar)').classed('unfocused', true);
    d3.select('.pageSlice.sidebar').classed('unfocused', false);
    return this.renderAllViews();
  }
  async hideSidebar () {
    d3.select('.pageSlice.sidebar').classed('unfocused', true);
    d3.select('.pageSlice:not(.sidebar)').classed('unfocused', false);
    return this.renderAllViews();
  }
}

export default Controller;
