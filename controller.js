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
      // filter hack, and then render all the views
      await less.pageLoadFinished;
      recolorImageFilter();
      this.updateViews();
    })();
  }
  setupViews () {
    this.explorerViews = {};
    for (const ViewClass of [DataManagerView, AdjacencyMatrixView, ResponseListView]) {
      this.explorerViews[ViewClass.type] = new ViewClass(d3.select(`.${ViewClass.type}`));
      this.explorerViews[ViewClass.type].render();
    }

    this.surveyViews = {};
    this.currentSurveyView = 'consent';
    this.surveyComponents = {
      'consent': { ViewClass: ConsentView },
      'domain': { ViewClass: DomainView },
      'dataType': { ViewClass: DataTypeView },
      'Tables(init)': { ViewClass: TablesView, transform: false },
      'Network(init)': { ViewClass: NetworkView, transform: false },
      'Field(init)': { ViewClass: FieldView, transform: false },
      'Geometry(init)': { ViewClass: GeometryView, transform: false },
      'Sets(init)': { ViewClass: SetsView, transform: false },
      'forcedTransformation': { ViewClass: ForcedTransformationView },
      'Tables(transform)': { ViewClass: TablesView, transform: true },
      'Network(transform)': { ViewClass: NetworkView, transform: true },
      'Field(transform)': { ViewClass: FieldView, transform: true },
      'Geometry(transform)': { ViewClass: GeometryView, transform: true },
      'Sets(transform)': { ViewClass: SetsView, transform: true },
      'debrief': { ViewClass: DebriefView }
    };
    const self = this;
    const surveySections = d3.select('.survey .wrapper')
      .selectAll('details')
      .data(d3.entries(this.surveyComponents), d => d.key)
      .enter().append('details')
      .on('toggle', function (d) {
        if (this.open) {
          self.currentSurveyView = d.key;
          self.updateViews();
        }
      });
    surveySections.append('summary');
    surveySections.append('div')
      .attr('class', d => 'surveyView ' + d.value.ViewClass.type);
    surveySections.each(function (d) {
      const d3el = d3.select(this).select('.surveyView');
      d.value.viewInstance = self.surveyViews[d.key] =
        new d.value.ViewClass(d3el, d.value.transform);
      d.value.viewInstance.render();
    });
    surveySections.select('summary')
      .text(d => d.value.viewInstance.humanLabel || 'WARNING: no humanLabel yet');

    // A little javascript help for mobile responsiveness
    const mainPanes = d3.selectAll('.explorer, .survey');
    mainPanes.on('click', function () {
      mainPanes.classed('unfocused', true);
      d3.select(this).classed('unfocused', false);
    });

    this.tooltip = new Tooltip();
    this.tooltip.render();

    d3.selectAll('[data-key]').on('change', () => {
      self.updateViews();
    });
  }
  advanceSurvey (nextView) {
    this.currentSurveyView = nextView;
    this.updateViews();
  }
  updateViews () {
    const formData = this.responses.getCurrentData();
    d3.select('.survey .wrapper')
      .selectAll('details')
      .attr('class', d => formData.viewStates[d.key].state)
      .property('open', d => d.key === this.currentSurveyView)
      .style('display', d => formData.viewStates[d.key].enabled ? null : 'none');
    d3.selectAll('[data-key]').classed('invalid', function () {
      return window.responses.currentResponse !== null && formData.invalidKeys[this.dataset.key];
    });
    this.surveyViews[this.currentSurveyView].render();
    for (const view of Object.values(this.explorerViews)) {
      view.render();
    }
  }
}

window.controller = new Controller();
