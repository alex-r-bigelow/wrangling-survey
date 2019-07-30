/* globals d3, less */
import Responses from './models/Responses.js';

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

import recolorImageFilter from './utils/recolorImageFilter.js';

class Controller {
  constructor () {
    this.responses = new Responses();
    this.setupViews();
    window.onresize = () => { this.updateViews(); };

    (async () => {
      await less.pageLoadFinished;
      recolorImageFilter();
      this.updateViews();
    })();
  }
  setupViews () {
    this.views = {};

    this.surveyComponents = {
      'consent': { ViewClass: ConsentView },
      'domain': { ViewClass: DomainView },
      'dataType': { ViewClass: DataTypeView },
      'tables(init)': { ViewClass: TablesView, transform: false },
      'network(init)': { ViewClass: NetworkView, transform: false },
      'field(init)': { ViewClass: FieldView, transform: false },
      'geometry(init)': { ViewClass: GeometryView, transform: false },
      'sets(init)': { ViewClass: SetsView, transform: false },
      'forcedTransformation': { ViewClass: ForcedTransformationView },
      'tables(transform)': { ViewClass: TablesView, transform: true },
      'network(transform)': { ViewClass: NetworkView, transform: true },
      'field(transform)': { ViewClass: FieldView, transform: true },
      'geometry(transform)': { ViewClass: GeometryView, transform: true },
      'sets(transform)': { ViewClass: SetsView, transform: true },
      'debrief': { ViewClass: DebriefView }
    };

    this.currentSurveyView = 'consent';

    const surveySections = d3.select('.survey')
      .selectAll('.surveyView')
      .data(d3.entries(this.surveyComponents), d => d.key)
      .enter().append('section')
      .style('display', d => d.key === this.currentSurveyView ? null : 'none')
      .attr('class', d => 'surveyView ' + d.value.ViewClass.type);
    const self = this;
    surveySections.each(function (d) {
      self.views[d.key] = new d.value.ViewClass(d3.select(this), d.value.transform);
    });
  }
  advanceSurvey (nextView) {
    this.currentSurveyView = nextView;
    this.updateViews();
  }
  async submitForm () {
    const formValues = this.responses.getFormValues();
    const googleForm = await d3.json('googleForm.json');
    const hiddenFrame = d3.select('body').append('iframe')
      .style('display', 'none');
    const frameDoc = hiddenFrame.node().contentDocument;
    let pollingInterval = window.setInterval(() => {
      if (frameDoc.location === null) {
        window.clearTimeout(pollingInterval);
        hiddenFrame.remove();
      }
    }, 200);
    const form = d3.select(frameDoc).select('body')
      .append('form')
      .attr('action', googleForm.action);
    form.selectAll('input')
      .data(d3.entries(googleForm.inputs))
      .enter().append('input')
      .attr('type', 'text')
      .attr('name', d => d.value)
      .property('value', d => formValues[d.key] || null);
    form.append('input')
      .attr('type', 'submit')
      .node().click();
  }
  updateViews () {
    d3.select('.survey')
      .selectAll('.surveyView')
      .style('display', d => d.key === this.currentSurveyView ? null : 'none');
    this.views[this.currentSurveyView].render();
    for (const view of Object.values(this.views)) {
      view.render();
    }
  }
}

window.controller = new Controller();
