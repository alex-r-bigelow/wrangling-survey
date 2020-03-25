/* globals d3, JsonUrl */
import Controller from './Controller.js';

import GlossaryResponseView from '../views/GlossaryView/GlossaryResponseView.js';
import FilterView from '../views/FilterView/FilterView.js';
import InsightsView from '../views/InsightsView/InsightsView.js';

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
import ReflectionsResponseView from '../views/ReflectionsView/ReflectionsResponseView.js';
import { DebriefResponseDasView, DebriefResponseEtsView } from '../views/DebriefView/DebriefResponseViews.js';

import ViewFilter from '../filters/ViewFilter.js';
import LikertFilter from '../filters/LikertFilter.js';
import FlagFilter from '../filters/FlagFilter.js';
import CheckedFilter from '../filters/CheckedFilter.js';
import TextFilter from '../filters/TextFilter.js';
import SingletonFilter from '../filters/SingletonFilter.js';
import TermFilter from '../filters/TermFilter.js';

const FILTER_LOOKUP = {
  ViewFilter,
  LikertFilter,
  FlagFilter,
  CheckedFilter,
  TextFilter,
  SingletonFilter,
  TermFilter
};

class VisController extends Controller {
  constructor () {
    super();
    this.jsonCodec = JsonUrl('lzw');
    this.filterList = [];

    this.msErrorText = `Thank you for your interest! Feel free to browse the \
data using IE or Edge, however you may encounter bugs. This site will work \
better in Firefox or Chrome.`;

    window.onpopstate = () => { this.parseFilters(); };
  }
  async finishSetup () {
    this.transitionList = this.database.getTransitionList();
    this.parseFilters(true);
  }
  async setupViews () {
    this.sidebarViews = await this.setupViewList([
      GlossaryResponseView,
      FilterView,
      InsightsView
    ], '.sidebar');
    this.visViews = await this.setupViewList([
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
      TablesResponseEtsView,
      NetworkResponseEtsView,
      SpatialResponseEtsView,
      GroupedResponseEtsView,
      TextualResponseEtsView,
      MediaResponseEtsView,
      ReflectionsResponseView,
      DebriefResponseEtsView
    ], '.vis');
  }
  async advanceSection (viewIndex = this.currentViewIndex + 1) {
    // Skip any disabled views
    while (this.visViews[viewIndex] && this.visViews[viewIndex].isDisabled()) {
      viewIndex++;
    }
    if (this.visViews[viewIndex]) {
      if (this.currentViewIndex !== viewIndex) {
        this.visViews[viewIndex].trigger('open');
      }
      this.currentViewIndex = viewIndex;
      this.updateUrl();
      this.renderAllViews();
    }
    return viewIndex;
  }
  async renderAllViews () {
    await super.renderAllViews();
    const self = this;
    d3.selectAll('.vis .wrapper')
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

    await Promise.all(this.sidebarViews.concat(this.visViews).map(view => {
      return view.render();
    }));
  }
  getFilteredTransitionList () {
    if (this.transitionList === undefined) {
      return [];
    }
    if (this._filteredTransitionList) {
      return this._filteredTransitionList;
    }
    this._filteredTransitionList = this.transitionList.filter(transition => {
      return this.filterList.every(filterObj => filterObj.test(transition));
    });
    return this._filteredTransitionList;
  }
  async updateUrl () {
    if (window.history.pushState) {
      const filterQuery = await this.jsonCodec.compress(this.filterList.map(filter => {
        return {
          type: filter.type,
          spec: filter.spec
        };
      }));
      const search = `?viewIndex=${this.currentViewIndex}&filters=${filterQuery}`;
      const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}${search}`;
      if (!window.location.search || search === window.location.search) {
        // Don't push state if the page just loaded or the URL is redundant
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } else {
        window.history.pushState({ path: newUrl }, '', newUrl);
      }
    }
  }
  async parseFilters (forceAdvance) {
    const params = new URLSearchParams(window.location.search);
    const rawQuery = params.get('filters');
    if (rawQuery) {
      const filterSpecs = await this.jsonCodec.decompress(rawQuery);
      this.filterList = filterSpecs.map(filterSpec => {
        return new FILTER_LOOKUP[filterSpec.type](filterSpec.spec);
      });
    } else {
      this.filterList = [];
    }
    delete this._filteredTransitionList;

    let viewIndex = params.get('viewIndex');
    viewIndex = viewIndex === null ? 0 : parseInt(viewIndex);
    if (!isNaN(viewIndex) && (forceAdvance || viewIndex !== this.currentViewIndex)) {
      this.advanceSection(viewIndex);
    }
    this.renderAllViews();
  }
  addFilter (filterObj) {
    delete this._filteredTransitionList;
    this.filterList.push(filterObj);
    this.updateUrl();
    this.renderAllViews();
  }
  removeFilter (index) {
    delete this._filteredTransitionList;
    this.filterList.splice(index, 1);
    this.updateUrl();
    this.renderAllViews();
  }
  lookupFilter (humanLabel) {
    return this.findFilter(filterObj => filterObj.humanLabel === humanLabel);
  }
  findFilter (func) {
    return this.filterList.findIndex(func);
  }
  toggleFilter (filterObj) {
    delete this._filteredTransitionList;
    const existingIndex = this.lookupFilter(filterObj.humanLabel);
    if (existingIndex === -1) {
      this.filterList.push(filterObj);
    } else {
      this.filterList.splice(existingIndex, 1);
    }
    this.updateUrl();
    this.renderAllViews();
  }
  rotateFilterState (filterStates) {
    delete this._filteredTransitionList;
    const existingFilterIndices = filterStates.map(filterObj => this.lookupFilter(filterObj.humanLabel));
    const i = existingFilterIndices.findIndex(j => j !== -1);
    if (i === -1) {
      this.filterList.push(filterStates[0]);
    } else if (i === filterStates.length - 1) {
      this.filterList.splice(existingFilterIndices[i], 1);
    } else {
      this.filterList[existingFilterIndices[i]] = filterStates[i + 1];
    }
    this.updateUrl();
    this.renderAllViews();
  }
  getHumanResponseType (responseType) {
    if (responseType === undefined) {
      return 'Either Abstraction';
    } else if (responseType === 'dasResponse') {
      return 'Initial Abstraction';
    } else if (responseType === 'etsResponse') {
      return 'Alternative Abstraction';
    }
  }
  showSidebar () {
    d3.select('.sidebar.pageSlice').classed('unfocused', false);
    d3.select('.vis.pageSlice').classed('unfocused', true);
    this.renderAllViews();
  }
  hideSidebar () {
    d3.select('.sidebar.pageSlice').classed('unfocused', true);
    d3.select('.vis.pageSlice').classed('unfocused', false);
    this.renderAllViews();
  }
}

window.controller = new VisController();
