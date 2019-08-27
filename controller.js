/* globals d3, less */
import Responses from './models/Responses.js';

import DataManagerView from './views/DataManagerView/DataManagerView.js';
import ResponseListView from './views/ResponseListView/ResponseListView.js';
import AdjacencyMatrixView from './views/AdjacencyMatrixView/AdjacencyMatrixView.js';

import ConsentView from './views/ConsentView/ConsentView.js';
import DomainView from './views/DomainView/DomainView.js';
import DataTypeView from './views/DataTypeView/DataTypeView.js';
import TablesView from './views/TablesView/TablesView.js';
import NetworkView from './views/NetworkView/NetworkView.js';
import FieldView from './views/FieldView/FieldView.js';
import GeometryView from './views/GeometryView/GeometryView.js';
import SetsView from './views/SetsView/SetsView.js';
import ForcedTransformationView from './views/ForcedTransformationView/ForcedTransformationView.js';
import DebriefView from './views/DebriefView/DebriefView.js';

import Tooltip from './views/Tooltip/Tooltip.js';

import recolorImageFilter from './utils/recolorImageFilter.js';

window.DEBUG_VIEW = 'Network(init)';

class Controller {
  constructor () {
    window.responses = this.responses = new Responses();
    this.responses.on('update', () => { this.updateViews(); });

    this.setupViews();
    window.onresize = () => { this.updateViews(); };

    (async () => {
      // Get the full google spreadsheet of all the results
      // (I doubt it will get beyond the 400k response tier)
      this.responses.getAllResponses();
    })();

    (async () => {
      // Wait for LESS to finish loading before applying our SVG
      // filter hack
      await less.pageLoadFinished;
      recolorImageFilter();
    })();
  }
  setupViews () {
    this.explorerViews = {};
    for (const ViewClass of [DataManagerView, AdjacencyMatrixView, ResponseListView]) {
      this.explorerViews[ViewClass.type] = new ViewClass(d3.select(`.${ViewClass.type}`));
      this.explorerViews[ViewClass.type].render();
    }

    this.surveyViews = {};
    this.currentSurveyView = window.DEBUG_VIEW || 'consent';
    this.surveyComponents = [
      { viewName: 'consent', ViewClass: ConsentView },
      { viewName: 'domain', ViewClass: DomainView },
      { viewName: 'dataType', ViewClass: DataTypeView },
      { viewName: 'Tables(init)', ViewClass: TablesView, transform: false },
      { viewName: 'Network(init)', ViewClass: NetworkView, transform: false },
      { viewName: 'Field(init)', ViewClass: FieldView, transform: false },
      { viewName: 'Geometry(init)', ViewClass: GeometryView, transform: false },
      { viewName: 'Sets(init)', ViewClass: SetsView, transform: false },
      { viewName: 'forcedTransformation', ViewClass: ForcedTransformationView },
      { viewName: 'Tables(transform)', ViewClass: TablesView, transform: true },
      { viewName: 'Network(transform)', ViewClass: NetworkView, transform: true },
      { viewName: 'Field(transform)', ViewClass: FieldView, transform: true },
      { viewName: 'Geometry(transform)', ViewClass: GeometryView, transform: true },
      { viewName: 'Sets(transform)', ViewClass: SetsView, transform: true },
      { viewName: 'debrief', ViewClass: DebriefView }
    ];
    const self = this;
    const surveySections = d3.select('.survey .wrapper')
      .selectAll('details')
      .data(this.surveyComponents, d => d.viewName)
      .enter().append('details')
      .on('toggle', function (d) {
        if (this.open) {
          self.advanceSurvey(d.viewName);
        }
      });
    surveySections.append('summary');
    surveySections.append('div')
      .attr('class', d => 'surveyView ' + d.ViewClass.type);
    surveySections.each(function (d) {
      const d3el = d3.select(this).select('.surveyView');
      d.viewInstance = self.surveyViews[d.viewName] = new d.ViewClass(
        d3el, d.transform);
      d.viewInstance.render();
    });
    surveySections.select('summary')
      .text(d => d.viewInstance.humanLabel || 'WARNING: no humanLabel yet');

    // A little javascript help for mobile responsiveness
    const mainPanes = d3.selectAll('.explorer, .survey');
    mainPanes.on('click', function () {
      mainPanes.classed('unfocused', true);
      d3.select(this).classed('unfocused', false);
    });

    this.tooltip = new Tooltip();
    (async () => {
      await Promise.all(Object.values(this.surveyViews).map(view => {
        return view.render();
      }));
      // A couple general-purpose things should only load after all the views
      // have populated themselves completely
      this.tooltip.dirty = true;
      this.tooltip.render();
      d3.selectAll('[data-key]').on('change', () => {
        self.updateViews();
      });
      self.updateViews();
    })();
  }
  advanceSurvey (nextView) {
    this.currentSurveyView = nextView;
    this.surveyViews[this.currentSurveyView].trigger('open');
    this.forceInvalidFieldWarnings = false;
    this.updateViews();
  }
  updateViews () {
    const self = this;
    const formData = this.responses.getCurrentData();
    d3.select('.survey .wrapper')
      .selectAll('details')
      .attr('class', d => formData.viewStates[d.viewName].state)
      .property('open', d => d.viewName === this.currentSurveyView)
      .style('display', d => formData.viewStates[d.viewName].enabled ? null : 'none');
    d3.selectAll('.next.button')
      .classed('disabled', function () {
        const viewName = d3.select(this.parentNode.parentNode).datum().viewName;
        return !formData.viewStates[viewName].valid;
      })
      .on('click', function () {
        const boundData = d3.select(this.parentNode.parentNode).datum();
        if (formData.viewStates[boundData.viewName].valid) {
          const nextView = boundData.viewInstance.getNextView();
          self.advanceSurvey(nextView);
        } else {
          self.forceInvalidFieldWarnings = true;
          self.updateViews();
        }
      });
    d3.selectAll('.invalid').classed('invalid', false);
    if (window.responses.currentResponse !== null || this.forceInvalidFieldWarnings) {
      for (const invalidId of Object.keys(formData.invalidIds)) {
        d3.select(`#${invalidId}`).classed('invalid', true);
      }
    }
    this.surveyViews[this.currentSurveyView].render();
    for (const view of Object.values(this.explorerViews)) {
      view.render();
    }
  }
}

window.controller = new Controller();
