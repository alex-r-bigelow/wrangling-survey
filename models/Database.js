/* globals sha256 */
import { Model } from '../node_modules/uki/dist/uki.esm.js';

const SURVEY_VERSION = '1.0.0';

// window.SANDBOX_MODE = true;

const THINKING_ORDER = ['Never', 'Rarely', 'Sometimes', 'Very often', 'Always'];
const RAW_DATA_ORDER = ['Very inaccurate', 'Moderately inaccurate', 'Neither inaccurate nor accurate', 'Moderately accurate', 'Accurate'];

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

    this.browserId = window.localStorage.getItem('browserId');
    if (this.browserId === null) {
      this.browserId = sha256((new Date()).toISOString() + Math.random());
      window.localStorage.setItem('browserId', this.browserId);
    }

    // Survey versioning, in case we need to purge / tweak pilot participants'
    // localStorage in the future
    this.surveyVersion = window.localStorage.getItem('surveyVersion');
    if (!this.surveyVersion || this.surveyVersion !== SURVEY_VERSION) {
      // Nuke localStorage to avoid corruption across versions, preserving only
      // browserId
      window.localStorage.clear();
      window.localStorage.setItem('browserId', this.browserId);
      this.surveyVersion = SURVEY_VERSION;
    }
    window.localStorage.setItem('surveyVersion', this.surveyVersion);

    const params = new URLSearchParams(window.location.search);
    this.context = params.get('context');
    if (!this.context) {
      this.context = window.localStorage.getItem('context');
      if (!this.context) {
        this.context = 'unknown';
      }
    }
    window.localStorage.setItem('context', this.context);

    this.unfinishedResponses = window.localStorage.getItem('unfinishedResponses');
    this.unfinishedResponses = this.unfinishedResponses ? JSON.parse(this.unfinishedResponses) : {};

    this.pendingResponseStrings = window.localStorage.getItem('pendingResponseStrings');
    this.pendingResponseStrings = this.pendingResponseStrings ? JSON.parse(this.pendingResponseStrings) : {};

    this.combineTerminology();

    this.loadingData = true;

    this.on('load', () => {
      this.updateData();
    });
  }
  getPendingResponses () {
    return Object.values(this.pendingResponseStrings).reduce((agg, responseStringList) => {
      return agg.concat(responseStringList.map(responseString => JSON.parse(responseString)));
    }, []);
  }
  combineTerminology () {
    const responseLists = [
      Object.values(this.unfinishedResponses),
      this.getPendingResponses()
    ];
    if (this.ownedResponses) {
      responseLists.push(...Object.values(this.ownedResponses));
    }
    // Combine all of the terminology, sorted by timestamp
    this.terminology = {};
    const sortedTerminology = responseLists
      .reduce((agg, responseList) => {
        return agg.concat(responseList);
      }, [])
      .sort((a, b) => new Date(a.submitTimestamp) - new Date(b.submitTimestamp))
      .map(response => response.terminology || {});
    Object.assign(this.terminology, ...sortedTerminology);
    // Combine all of the alternateDefinitions, sorted by timestamp
    this.alternateDefinitions = {};
    const sortedDefs = responseLists
      .reduce((agg, responseList) => {
        return agg.concat(responseList);
      }, [])
      .sort((a, b) => new Date(a.submitTimestamp) - new Date(b.submitTimestamp))
      .map(response => response.alternateDefinitions || {});
    Object.assign(this.alternateDefinitions, ...sortedDefs);
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
          return window.fetch(tableSpec[1].publicData, { method: 'GET' })
            .then(async serverResponse => {
              const fullText = await serverResponse.text();
              const jsonOnly = fullText.match(/{.*}/)[0];
              // Parse the full JSON
              const rawTable = JSON.parse(jsonOnly).table;
              if (rawTable.parsedNumHeaders !== 1) {
                // No responses yet; Google doesn't parse the header row
                this.publicData[tableSpec[0]] = [];
              } else {
                this.publicData[tableSpec[0]] = rawTable.rows.map(row => {
                  const payloadString = row.c[1].v;
                  const result = JSON.parse(payloadString);
                  // Before we add it to the public data, does this response belong to the current user?
                  if (result.browserId === this.browserId) {
                    this.ownedResponses[tableSpec[0]] = this.ownedResponses[tableSpec[0]] || [];
                    this.ownedResponses[tableSpec[0]].push(result);
                  }
                  // Was this a pending response? If so, we can clean it out
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
            }).catch(error => {
              console.warn('Error accessing public data', error);
            });
        });
      await Promise.all(dataPromises);
      this.combineTerminology();
      this.loadingData = false;
      this.trigger('update');
      resolve();
    });
    return this.dataPromise;
  }
  setResponse (tableName, responseValues) {
    if (!responseValues.startTimestamp) {
      responseValues.startTimestamp = new Date().toISOString();
    }
    this.unfinishedResponses[tableName] = responseValues;
    Object.assign(this.terminology, responseValues.terminology || {});
    Object.assign(this.alternateDefinitions, responseValues.alternateDefinitions || {});
    window.localStorage.setItem('unfinishedResponses', JSON.stringify(this.unfinishedResponses));
  }
  async submitResponse (tableName, anonymous = false) {
    // Ensure that a fresh 'update' event will fire, and that we don't clobber any other responses being submitted
    await this.dataPromise;
    const responseValues = this.unfinishedResponses[tableName];
    if (!anonymous) {
      responseValues.browserId = this.browserId;
    }

    // Store the survey version number
    responseValues.surveyVersion = this.surveyVersion;

    // We use our own timestamp instead of the one in Google sheets to avoid inconsistencies between pending and accepted responses
    responseValues.submitTimestamp = new Date().toISOString();
    const stringValues = JSON.stringify(responseValues);

    // Store the response as pending
    this.pendingResponseStrings[tableName] = this.pendingResponseStrings[tableName] || [];
    this.pendingResponseStrings[tableName].push(stringValues);
    window.localStorage.setItem('pendingResponseStrings', JSON.stringify(this.pendingResponseStrings));
    delete this.unfinishedResponses[tableName];
    window.localStorage.setItem('unfinishedResponses', JSON.stringify(this.unfinishedResponses));

    if (window.SANDBOX_MODE) {
      console.warn(`Not submitting response to ${tableName}, because SANDBOX_MODE is enabled:`, responseValues);
      return this.updateData();
    }

    // Submit the JSON via the Google form
    let url = `${this.resources[0][tableName].action}?${this.resources[0][tableName].field}=${encodeURIComponent(stringValues)}`;
    try {
      // Unfortunately, the response object returned from fetch (submitting to
      // google) doesn't contain much that's useful about whether or not it was
      // successful. Instead, we just redirect regardless to the main page, and
      // we can debug IRL if we don't see entries
      await window.fetch(url, {
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Error submitting response:', error);
      return Promise.reject(error);
    }
  }
  async getPublicResponses (tableName) {
    await this.dataPromise;
    return this.publicData[tableName];
  }
  async getOwnedResponses (tableName) {
    await this.dataPromise;
    return this.ownedResponses[tableName];
  }
  getUserResponseSummary () {
    const result = {
      responses: {},
      datasetList: [],
      terminology: {},
      alternateDefinitions: {}
    };
    // First copy all of this users' responses, and flag pending ones as such
    for (const [ownedKey, ownedList] of Object.entries(this.ownedResponses)) {
      result.responses[ownedKey] = JSON.parse(JSON.stringify(ownedList));
    }
    for (const [pendingKey, pendingStrings] of Object.entries(this.pendingResponseStrings)) {
      result.responses[pendingKey] = result.responses[pendingKey] || [];
      for (const pendingString of pendingStrings) {
        const response = JSON.parse(pendingString);
        response.pending = true;
        result.responses[pendingKey].push(response);
      }
    }
    // Add the combined terminology from this and previous responses
    Object.assign(result.terminology, this.terminology);
    Object.assign(result.alternateDefinitions, this.alternateDefinitions);
    // Collect the datasets, sort relevant explorations into them, and determine
    // the ideal next alternate to explore
    result.datasetList = (result.responses['DR.DAS'] || []).map(dataset => {
      dataset.alternateExplorations = {};
      dataset.nextAlternates = [];
      for (const targetType of ['tabular', 'network', 'spatial', 'grouped', 'textual', 'media']) {
        dataset.alternateExplorations[targetType] = (result.responses['DR.ETS'] || [])
          .filter(exploration => {
            return exploration.targetType === targetType &&
              exploration.datasetLabel === dataset.datasetLabel &&
              exploration.datasetSubmitTimestamp === dataset.submitTimestamp;
          });
        dataset.nextAlternates.push({
          targetType,
          priorAlternateCount: dataset.alternateExplorations[targetType].length,
          nativeThinking: dataset[targetType + 'Thinking'],
          nativeRawData: dataset[targetType + 'RawData'] || 'N/A'
        });
      }
      // Sort the list of nextAternates...
      dataset.nextAlternates.sort((a, b) => {
        // First sort by the number of times the user has already explored this targetType
        if (a.priorAlternateCount) {
          if (b.priorAlternateCount) {
            return a.priorAlternateCount - b.priorAlternateCount;
          } else {
            return 1;
          }
        } else if (b.priorAlternateCount) {
          return -1;
        }
        // Next, sort by the most rare thinking interpretation
        const thinkingDiff = THINKING_ORDER.indexOf(a.nativeThinking) - THINKING_ORDER.indexOf(b.nativeThinking);
        if (thinkingDiff !== 0) {
          return thinkingDiff;
        }

        // Next, sort by the most rare native interpretation
        const rawDataDiff = RAW_DATA_ORDER.indexOf(a.nativeRawData) - RAW_DATA_ORDER.indexOf(b.nativeRawData);
        if (rawDataDiff !== 0) {
          return rawDataDiff;
        }

        // Finally, sort randomly
        return Math.sign(Math.random() - 0.5);
      });
      // Attach a list of other priors to each alternate:
      for (const alternate of dataset.nextAlternates) {
        alternate.otherPriors = JSON.stringify(dataset.nextAlternates.filter(otherAlternate => {
          return otherAlternate.targetType !== alternate.targetType &&
            (otherAlternate.priorAlternateCount > 0 ||
             otherAlternate.nativeThinking !== 'Never' ||
             otherAlternate.nativeRawData !== 'Very inaccurate');
        }).map(otherAlternate => otherAlternate.targetType));
      }
      return dataset;
    });
    return result;
  }
  getTransitionList () {
    // Build a list of every pairwise transition
    const transitionList = [];
    // [ {dasResponse, etsResponse}, ... ]

    const browserIdLookup = {};
    const dasResponses = (this.publicData['DR.DAS'] || []).concat(
      (this.pendingResponseStrings['DR.DAS'] || []).map(dasString => {
        return Object.assign({ pending: true }, JSON.parse(dasString));
      }));
    for (const dasResponse of dasResponses) {
      const browserId = dasResponse.browserId;
      browserIdLookup[browserId] = browserIdLookup[browserId] || {};
      const dasId = dasResponse.datasetLabel + dasResponse.submitTimestamp;
      browserIdLookup[browserId][dasId] = dasResponse;
    }
    const etsResponses = (this.publicData['DR.ETS'] || []).concat(
      (this.pendingResponseStrings['DR.ETS'] || []).map(etsString => {
        return Object.assign({ pending: true }, JSON.parse(etsString));
      }));
    for (const etsResponse of etsResponses) {
      const browserId = etsResponse.browserId;
      const dasId = etsResponse.datasetLabel + etsResponse.datasetSubmitTimestamp;
      if (!browserIdLookup[browserId]) {
        console.warn(`Missing DAS response for browserId ${browserId}`);
      } else if (!browserIdLookup[browserId][dasId]) {
        console.warn(`Missing DAS response corresponding to ${etsResponse.datasetLabel} submitted at ${etsResponse.datasetSubmitTimestamp}`);
      } else {
        transitionList.push({
          dasResponse: browserIdLookup[browserId][dasId],
          etsResponse,
          transitionId: dasId + etsResponse.submitTimestamp
        });
      }
    }
    return transitionList;
  }
  get contextIsConference () {
    return ['VIS', 'Supercomputing'].indexOf(this.context) !== -1;
  }
  get contextIsArizona () {
    return ['HackyHour', 'CoffeeAndCode', 'UofA', 'HDC_Pilot'].indexOf(this.context) !== -1;
  }
  get contextIsDesignStudyReview () {
    return this.context === 'DesignStudyReview';
  }
}
export default Database;
