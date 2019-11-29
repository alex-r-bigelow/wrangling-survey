/* globals d3, less */
import { Model } from '../node_modules/uki/dist/uki.esm.js';
import Database from '../models/Database.js';
import FilterView from '../views/FilterView/FilterView.js';

import OverView from '../views/OverView/OverView.js';

import recolorImageFilter from '../utils/recolorImageFilter.js';

class VisController extends Model {
  constructor () {
    super();
    this.database = new Database();
    this.database.on('update', () => {
      this.transitionList = this.database.getTransitionList();
      this.renderAllViews();
    });

    this.filterList = [];
    this.filterView = new FilterView();

    this.visViews = [];
    this.currentViewIndex = 0;

    // detect IE8 and above, and edge
    if (document.documentMode || /Edge/.test(navigator.userAgent)) {
      window.alert(`Thank you for your interest! Feel free to browse the data
using IE or Edge, however you may encounter bugs. This site will work better in
Firefox or Chrome.`);
    }

    window.onresize = () => { this.renderAllViews(); };
    (async () => {
      await this.setupViews();
      this.filterView.hide();
      await less.pageLoadFinished;
      // Wait for LESS to finish loading before applying our SVG
      // filter hack
      recolorImageFilter();
      d3.select('.spinner').style('display', 'none');
    })();
  }
  async setupViews () {
    const self = this;
    this.visViews = [
      OverView
    ].map(View => new View());
    const sections = d3.select('.vis .wrapper')
      .selectAll('details')
      .data(this.visViews)
      .enter().append('details')
      .on('toggle.vis', function (d, i) {
        if (this.open) {
          self.advanceSection(i);
        }
      });
    const header = sections.append('summary');
    header.append('div')
      .html(d => d.humanLabel);
    sections.append('div')
      .attr('class', d => d.className);
    await Promise.all(sections.nodes().map(async node => {
      const d3el = d3.select(node);
      const viewInstance = d3el.datum();
      // Assign DOM elements to each view, and ensure views create all their DOM
      // elements before the next cross-cutting steps
      await viewInstance.render(d3.select(node).select(`.${viewInstance.className}`));
    }));
  }
  async advanceSection (viewIndex = this.currentViewIndex + 1) {
    // Skip any disabled views
    while (!this.visViews[viewIndex].isVisible()) {
      viewIndex++;
    }
    if (this.visViews[viewIndex]) {
      if (this.currentViewIndex !== viewIndex) {
        this.visViews[viewIndex].trigger('open');
      }
      this.currentViewIndex = viewIndex;
      this.renderAllViews();
    }
    return viewIndex;
  }
  async renderAllViews () {
    const self = this;
    d3.select('.vis .wrapper')
      .selectAll('details')
      .classed('disabled', d => !d.isVisible())
      .property('open', (d, i) => i === this.currentViewIndex)
      .each(function (d, i) {
        const detailsElement = d3.select(this);
        detailsElement.select('.next.button')
          .on('click', () => {
            self.advanceSection();
          });
      });
    await this.filterView.render();
    await Promise.all(this.visViews.map(view => view.render()));
  }
  get unfinishedResponse () {
    return this.database.unfinishedResponses[this.tableName] || null;
  }
  getFilteredTransitionList () {
    if (this.transitionList === undefined) {
      return null;
    }
    if (this._filteredTransitionList) {
      return this._filteredTransitionList;
    }
    this._filteredTransitionList = [];
    for (const transition of this.transitionList) {
      for (const filterObj of this.filterList) {
        if (filterObj.test(transition)) {
          this._filteredTransitionList.push(transition);
        }
      }
    }
    return this._filteredTransitionList;
  }
  addFilter (filterObj) {
    delete this._filteredTransitionList;
    this.filterList.push(filterObj);
  }
  removeFilter (index) {
    delete this._filteredTransitionList;
    this.filterList.splice(index, 1);
  }
}

window.controller = new VisController();
