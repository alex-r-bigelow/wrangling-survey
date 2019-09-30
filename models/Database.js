/* globals sha256, d3 */
import { Model } from '../node_modules/uki/dist/uki.esm.js';

window.SANDBOX_MODE = true;

/**
 * A sneaky way to use google forms as a cheap database. For each "table" that
 * you want:
 * 1. Create a Google Form with a single Paragraph question
 * 2. Create a new Response sheet
 * 3. Create an entry in databaseConfig.json:
 *    - changing the "action" URL to point to your form
 *    - changing the "field" value to be the "aria-label" attribute of the HTML
 *      field that Google creates in a preview of its form
 * If you want the table to be public + loaded into your web app:
 * 4. Make the Response sheet accessible to anyone with the link
 * 5. Create a "publicData" field for the entry in databaseConfig.json, pointing
 *    to your spreadsheet
 * If you want to moderate submitted data before it goes live for everyone to
 * see, DON'T make the response sheet accessible. Instead, point publicData to a
 * different (public) sheet, where you manually paste in approved data from the
 * original (private) sheet
 */
class Database extends Model {
  constructor () {
    super([
      { type: 'json', url: 'models/databaseConfig.json' }
    ]);

    const params = new URLSearchParams(window.location.search);

    this.context = window.localStorage.getItem('context');
    if (!this.context) {
      const temp = params.get('context');
      if (temp) {
        this.context = temp;
        window.localStorage.setItem('context', this.context);
      }
    }

    this.browserId = window.localStorage.getItem('browserId');
    if (this.browserId === null) {
      this.browserId = sha256((new Date()).toISOString());
      window.localStorage.setItem('browserId', this.browserId);
    }

    this.unfinishedResponses = window.localStorage.getItem('unfinishedResponses');
    this.unfinishedResponses = this.unfinishedResponses ? JSON.parse(this.unfinishedResponses) : {};

    this.pendingResponseStrings = window.localStorage.getItem('pendingResponseStrings');
    this.pendingResponseStrings = this.pendingResponseStrings ? JSON.parse(this.pendingResponseStrings) : {};

    this.loadingData = true;

    this.on('load', () => {
      this.updateData();
    });
  }
  async updateData () {
    if (this.loadingData && this.dataPromise) {
      return this.dataPromise;
    }
    this.loadingData = true;
    this.dataPromise = new Promise(async (resolve, reject) => {
      this.publicData = {};
      this.ownedResponses = {};

      const dataPromises = Object.entries(this.resources[0])
        // Only load public tables
        .filter(tableSpec => !!tableSpec[1].publicData)
        .map(tableSpec => {
          // Do a GET to pull each public data from its corresponding google sheet
          return window.fetch(tableSpec[1].publicData, { method: 'GET' }).then(async serverResponse => {
            const fullText = await serverResponse.text();
            const jsonOnly = fullText.match(/{.*}/)[0];
            // Parse the full JSON
            const rawTable = JSON.parse(jsonOnly).table;
            if (rawTable.parsedNumHeaders !== 1) {
              // No responses yet; Google doesn't parse the header row
              this.publicData[tableSpec[0]] = [];
            } else {
              this.publicData[tableSpec[0]] = rawTable.rows.map(row => {
                // Combine Google's timestamp with the nested JSON in the cell
                const timestamp = new Date(row.c[0].f);
                const payloadString = row.c[1].v;
                const result = Object.assign({ timestamp }, JSON.parse(payloadString));
                // Before we add it to the public data, does this response belong to the current user?
                if (result.browserId === this.browserId) {
                  this.ownedResponses[tableSpec[0]] = this.ownedResponses[tableSpec[0]] || [];
                  this.ownedResponses[tableSpec[0]].push(result);
                }
                // Was this a pending response?
                if (this.pendingResponseStrings[tableSpec[0]]) {
                  const pendingResponseIndex = this.pendingResponseStrings[tableSpec[0]].indexOf(payloadString);
                  if (pendingResponseIndex !== -1) {
                    this.pendingResponseStrings[tableSpec[0]].splice(pendingResponseIndex, 1);
                    window.localStorage.setItem('pendingResponseStrings', JSON.stringify(this.pendingResponseStrings));
                  }
                }
                return result;
              });
            }
          });
        });
      await Promise.all(dataPromises);
      this.loadingData = false;
      this.trigger('update');
      resolve();
    });
    return this.dataPromise;
  }
  setResponse (tableName, responseValues) {
    this.unfinishedResponses[tableName] = responseValues;
    window.localStorage.setItem('unfinishedResponses', JSON.stringify(this.unfinishedResponses));
  }
  async submitResponse (tableName, anonymous = false) {
    // Ensure that a fresh 'update' event will fire, and that we don't clobber any other responses being submitted
    await this.dataPromise;
    const responseValues = this.unfinishedResponses[tableName];
    if (!anonymous) {
      responseValues.browserId = this.browserId;
    }
    const stringValues = JSON.stringify(responseValues);

    // Make a fake, temporary form to submit to Google
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
      .attr('action', this.resources[0][tableName].action);
    form.append('input')
      .attr('type', 'text')
      .attr('name', this.resources[0][tableName].field)
      .property('value', stringValues);
    const submitButton = form.append('input')
      .attr('type', 'submit')
      .node();
    if (!window.SANDBOX_MODE) {
      submitButton.click();
    } else {
      console.warn(`Not submitting response to ${tableName}, because SANDBOX_MODE is enabled:`, responseValues);
    }
    form.remove();

    // Store the response as pending
    this.pendingResponseStrings[tableName] = this.pendingResponseStrings[tableName] || [];
    this.pendingResponseStrings[tableName].push(stringValues);
    window.localStorage.setItem('pendingResponseStrings', JSON.stringify('pendingResponseStrings'));
    delete this.unfinishedResponses[tableName];
    window.localStorage.setItem('unfinishedResponses', JSON.stringify(this.unfinishedResponses));
    return this.updateData();
  }
  async getPublicResponses (tableName) {
    await this.dataPromise;
    return this.publicData[tableName];
  }
  async getOwnedResponses (tableName) {
    await this.dataPromise;
    return this.ownedResponses[tableName];
  }
  get contextIsConference () {
    return ['VIS', 'Supercomputing'].indexOf(this.context) !== -1;
  }
  get contextIsDesignStudyReview () {
    return this.context === 'DesignStudyReview';
  }
}
export default Database;
