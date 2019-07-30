/* globals sha256 */
import { Model } from '../node_modules/uki/dist/uki.esm.js';

class Responses extends Model {
  constructor () {
    super();
    this.initCookie();
    this.allDatasets = {};
    this.currentDataset = null;
    this.currentExploration = null;
  }
  initCookie () {
    this.cookie = window.localStorage.getItem('surveyCookie');
    if (this.cookie === null) {
      this.resetCookie();
    }
  }
  resetCookie () {
    this.cookie = sha256((new Date()).toISOString());
    window.localStorage.setItem('surveyCookie', this.cookie);
  }
  setDomainOptions (options) {
    const datasetLabel = options.datasetLabel;
    if (!datasetLabel) {
      // If the user checks another option before providing a label, DomainView
      // will still send those options again
      return;
    } else if (this.allDatasets[datasetLabel]) {
      // Just overriding domain details
      this.currentDataset = this.allDatasets[datasetLabel];
      Object.assign(this.currentDataset, options);
    } else {
      this.currentDataset = this.allDatasets[datasetLabel] = options;
      this.currentExploration = {};
      this.currentDataset.explorations = [this.currentExploration];
    }
    this.trigger('update');
  }
  setDataTypeOptions (options) {
    if (this.currentExploration.started) {
      // Changing dataType options at this stage would invalidate a lot; start
      // a new exploration instead
      this.currentExploration = options;
      this.currentDataset.explorations.push(this.currentExploration);
    } else {
      Object.assign(this.currentExploration, options);
    }
    this.trigger('update');
  }
  getFormValues () {
    // TODO: migrate form submission here from controller, and set
    // currentExploration.submitted to true when successful
    if (!this.currentDataset || !this.currentExploration) {
      throw new Error('No data to submit');
    }
    if (this.currentExploration.submitted) {
      throw new Error('Current exploration has already been submitted');
    }
    // Flatten all the data together
    const result = Object.assign({ cookie: this.cookie }, this.currentDataset, this.currentExploration);
    // Purge metadata that isn't part of the form
    delete result.explorations;
    delete result.started;
    // Data validation
    if (result.datasetType === 'N/A') {
      delete result.datasetIsHybrid;
    } else {
      delete result.noTypeExplanation;
    }
    return result;
  }
}
export default Responses;
