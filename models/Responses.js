/* globals d3, sha256 */
import { Model } from '../node_modules/uki/dist/uki.esm.js';

class Responses extends Model {
  constructor () {
    super();
    this.allResponses = [];
    this.currentResponse = null; // null or an integer index into allResponses
    this.invalidResponse = null; // results of getViewStates() if the user attempts to submit an invalid form
    this.cookie = null;
  }
  resetCookie () {
    this.cookie = sha256((new Date()).toISOString());
    window.localStorage.setItem('surveyCookie', this.cookie);
  }
  async getAllResponses () {
    const response = await window.fetch(`https://cors-anywhere.herokuapp.com/https://spreadsheets.google.com/tq?tqx=out:json&tq=&key=1t1WP-2-W09ifOsOFx1AgvdGnEChE05mLiAE1fIN6ajA&gid=1539974328`, {
      method: 'GET'
    });
    const table = JSON.parse((await response.text()).match(/{.*}/)[0]).table;
    this.allResponses = table.rows.map(row => {
      const rowObj = {};
      for (const [columnIndex, cell] of row.c.entries()) {
        // TODO: standardize a bit...
        rowObj[table.cols[columnIndex].label] = cell;
      }
      return rowObj;
    });
  }
  async submitForm () {
    const currentData = this.getCurrentData();
    if (!currentData.valid) {
      console.warn(`User somehow submitted an invalid form`);
      return;
    }
    if (this.currentResponse !== null) {
      const subject = encodeURIComponent('[Survey] Data Correction');
      let cookieWarning = '';
      if (currentData.formValues['cookie'] !== currentData.priorFormValues['cookie']) {
        cookieWarning = `<p>[This does not appear to be data submitted by this
browser; please do not submit requests to change others' data, unless you are
reporting data that is a clear abuse of this survey]</p>`;
        currentData.formValues['e678'] = true;
      }
      const body = encodeURIComponent(`
<p>To the study coordinator:</p>
${cookieWarning}
<p>I would like to [make the following data correction] or [remove the following data]:</p>
<pre>
${JSON.stringify(currentData, null, 2)}
</pre>
`);
      window.open(`mailto:alexrbigelow@email.arizona.edu?subject=${subject}&body=${body}`);
      return;
    }
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
      .property('value', d => currentData.formValues[d.key] || null);
    const inputElement = form.append('input')
      .attr('type', 'submit')
      .node();
    if (!window.SANDBOX_MODE) {
      inputElement.click();
    }
    form.remove();
  }
  getCurrentData () {
    const result = {
      formValues: { cookie: this.cookie },
      viewStates: {}
    };
    for (const { viewName, viewInstance } of window.controller.surveyComponents) {
      const enabled = viewInstance.isEnabled(result.formValues);
      if (enabled) {
        // Collect the current state of the fields
        for (const element of viewInstance.keyElements) {
          const key = element.dataset.key;
          if (element.dataset.flag) {
            result.formValues[key] = result.formValues[key] || [];
            if (element.checked) {
              result.formValues[element.dataset.key].push(element.dataset.flag);
            }
          } else if (element.dataset.role) {
            result.formValues[key] = result.formValues[key] || {};
            result.formValues[key][element.dataset.role] = element.value;
          } else if (element.dataset.checkedValue) {
            if (element.checked) {
              result.formValues[key] = element.dataset.checkedValue;
            }
          } else {
            result.formValues[key] = element.value;
          }
        }
        // Clean / validate values + flag invalid form elements
        const viewState = viewInstance.validateForm(result.formValues);
        viewState.enabled = enabled;
        if (viewState.valid) {
          viewState.state = this.currentResponse === null ? 'complete' : 'changesValid';
        } else {
          viewState.state = this.currentResponse === null ? 'incomplete' : 'invalid';
        }
        result.viewStates[viewName] = viewState;
      } else {
        result.viewStates[viewName] = {
          valid: true,
          enabled: false,
          state: 'hidden',
          invalidIds: {}
        };
      }
    }
    result.valid = Object.values(result.viewStates).every(viewState => viewState.valid);
    result.invalidIds = Object.assign({}, ...Object.values(result.viewStates).map(viewState => viewState.invalidIds || {}));
    // Compare to previous data (i.e. if the user is editing)
    if (this.currentResponse !== null) {
      result.priorFormValues = this.allResponses[this.currentResponse];
      result.diff = {};
      for (const [key, value] of Object.entries(result.formValues)) {
        if (result.priorFormValues[key] !== value) {
          result.diff[key] = { before: result.priorFormValues[key], after: value };
        }
      }
    }
    return result;
  }
}
export default Responses;
