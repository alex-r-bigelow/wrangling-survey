/* globals d3, less, JsonUrl */
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

import ViewFilter from '../../filters/ViewFilter.js';
import LikertFilter from '../../filters/LikertFilter.js';
import FlagFilter from '../../filters/FlagFilter.js';
import CheckedFilter from '../../filters/CheckedFilter.js';
import TextFilter from '../../filters/TextFilter.js';
import SingletonFilter from '../../filters/SingletonFilter.js';

import recolorImageFilter from '../utils/recolorImageFilter.js';

const FILTER_LOOKUP = {
  ViewFilter,
  LikertFilter,
  FlagFilter,
  CheckedFilter,
  TextFilter,
  SingletonFilter
};

class VisController extends Model {
  constructor () {
    super();
    this.database = new Database();
    this.database.on('update', () => {
      this.transitionList = this.database.getTransitionList();
      this.parseFilters();
      this.renderAllViews();
    });

    this.jsonCodec = JsonUrl('lzma');
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
    window.onpopstate = () => { this.parseFilters(); };

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
      .classed('viewFilter', true)
      .attr('title', 'This is the number of participants that saw this section');
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
      this.updateUrl();
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
  async parseFilters () {
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
    if (viewIndex !== null) {
      viewIndex = parseInt(viewIndex);
      if (!isNaN(viewIndex) && viewIndex !== this.currentViewIndex) {
        this.advanceSection(viewIndex);
      }
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
}

window.controller = new VisController();
