/* globals d3 */
import SurveyController from './SurveyController.js';

import ConsentView from '../views/ConsentView/ConsentView.js';
import GdprView from '../views/GdprView/GdprView.js';
import SettingsView from '../views/SettingsView/SettingsView.js';
import AboutView from '../views/AboutView/AboutView.js';
import DashboardView from '../views/DashboardView/DashboardView.js';

class LandingPageController extends SurveyController {
  constructor () {
    super('DR.UID', [
      ConsentView,
      GdprView,
      SettingsView,
      AboutView,
      DashboardView
    ]);
  }
  get unfinishedResponse () {
    if (super.unfinishedResponse) {
      return super.unfinishedResponse;
    }
    // Always treat contact settings as "unfinished;" we'll never have access to
    // the submitted response in Google docs because it's private, but it will
    // still be hanging around in pendingResponseStrings (and will never get
    // cleared out)
    const responseStrings = this.database.pendingResponseStrings[this.tableName];
    if (!responseStrings) {
      return null;
    }
    return JSON.parse(responseStrings[responseStrings.length - 1]);
  }
  renderSubmitButton (formData) {
    // We override the main version of this function because submit button is
    // really just limited to the Contact Settings pane, and we piggyback on
    // "validity" to auto-advance to views beyond it; we only really care about
    // "validity" in terms of the existence of an email address
    d3.select('.submit.button')
      .classed('disabled', !formData.viewStates[2].valid)
      .on('click', async () => {
        if (formData.viewStates[2].valid) {
          this.database.setResponse(this.tableName, formData.formValues);
          await this.database.submitResponse(this.tableName);
          window.location.href = 'index.html';
        } else {
          this.forceInvalidFieldWarnings = true;
          this.renderAllViews();
        }
      });
  }
}

window.controller = new LandingPageController();
