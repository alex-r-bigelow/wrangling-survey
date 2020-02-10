/* globals d3, less */
import { Model } from '../node_modules/uki/dist/uki.esm.js';
import Database from '../models/Database.js';

import FilterView from '../views/FilterView/FilterView.js';

import OverView from '../views/OverView/OverView.js';

import DomainResponseView from '../views/DomainView/DomainResponseView.js';
import BasicCharacteristicsResponseView from '../views/BasicCharacteristicsView/BasicCharacteristicsResponseView.js';
import DataTypeResponseView from '../views/DataTypeView/DataTypeResponseView.js';
import { TablesResponseDasView, TablesResponseEtsView } from '../views/TablesView/TablesResponseViews.js';
import { NetworkResponseDasView, NetworkResponseEtsView } from '../views/NetworkView/NetworkResponseViews.js';
import { SpatialResponseDasView, SpatialResponseEtsView } from '../views/SpatialView/SpatialResponseViews.js';
import { GroupedResponseDasView, GroupedResponseEtsView } from '../views/GroupedView/GroupedResponseViews.js';
import { TextualResponseDasView, TextualResponseEtsView } from '../views/TextualView/TextualResponseViews.js';
import { MediaResponseDasView, MediaResponseEtsView } from '../views/MediaView/MediaResponseViews.js';
import { DebriefResponseDasView, DebriefResponseEtsView } from '../views/DebriefView/DebriefResponseViews.js';

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
      OverView,
      DomainResponseView,
      BasicCharacteristicsResponseView,
      DataTypeResponseView,
      TablesResponseDasView,
      NetworkResponseDasView,
      SpatialResponseDasView,
      GroupedResponseDasView,
      TextualResponseDasView,
      MediaResponseDasView,
      DebriefResponseDasView,
      // TODO: add other das views here
      TablesResponseEtsView,
      NetworkResponseEtsView,
      SpatialResponseEtsView,
      GroupedResponseEtsView,
      TextualResponseEtsView,
      MediaResponseEtsView,
      DebriefResponseEtsView
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
    header.append('div')
      .classed('filterIndicators', true);
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
    while (this.visViews[viewIndex].isDisabled()) {
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
      .classed('disabled', d => d.isDisabled())
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
  getFilteredTransitionList () {
    if (this.transitionList === undefined) {
      return null;
    }
    if (this._filteredTransitionList) {
      return this._filteredTransitionList;
    }
    this._filteredTransitionList = this.transitionList.filter(transition => {
      return this.filterList.every(filterObj => filterObj.test(transition));
    });
    return this._filteredTransitionList;
  }
  addFilter (filterObj) {
    delete this._filteredTransitionList;
    this.filterList.push(filterObj);
    this.renderAllViews();
  }
  removeFilter (index) {
    delete this._filteredTransitionList;
    this.filterList.splice(index, 1);
    this.renderAllViews();
  }
  filterLabelIndex (humanLabel) {
    return this.findFilter(filterObj => filterObj.humanLabel === humanLabel);
  }
  findFilter (func) {
    return this.filterList.findIndex(func);
  }
  toggleFilter (filterObj) {
    delete this._filteredTransitionList;
    const existingIndex = this.filterLabelIndex(filterObj.humanLabel);
    if (existingIndex === -1) {
      this.filterList.push(filterObj);
    } else {
      this.filterList.splice(existingIndex, 1);
    }
    this.renderAllViews();
  }
  rotateFilterState (filterStates) {
    delete this._filteredTransitionList;
    const existingFilterIndices = filterStates.map(filterObj => this.filterLabelIndex(filterObj.humanLabel));
    const i = existingFilterIndices.findIndex(j => j !== -1);
    if (i === -1) {
      this.filterList.push(filterStates[0]);
    } else if (i === filterStates.length - 1) {
      this.filterList.splice(existingFilterIndices[i], 1);
    } else {
      this.filterList[existingFilterIndices[i]] = filterStates[i + 1];
    }
    this.renderAllViews();
  }
}

window.controller = new VisController();
