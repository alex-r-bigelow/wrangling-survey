/* globals d3 */
import Controller from './Controller.js';

import ConsentView from '../views/ConsentView/ConsentView.js';

class LandingPageController extends Controller {
  constructor () {
    super();

    this.redisplayConsent = false;

    this.views = [
      new ConsentView(d3.select('.ConsentView'))
    ];
  }
  async renderAllViews () {
    await super.renderAllViews();
    d3.select('.ConsentView').classed('hidden', this.redisplayConsent ||
      window.localStorage.getItem('consented') !== null);
    await Promise.all(this.views.map(view => view.render()));
    // Now that all the views have finished rendering, set up metadata collection
    // (relies on DOM elements already existing)
    await this.setupJTM();
  }
}

window.controller = new LandingPageController();
