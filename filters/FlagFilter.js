import Filter from './Filter.js';

class FlagFilter extends Filter {
  constructor (spec) {
    const humanResponseType = window.controller
      .getHumanResponseType(spec.responseType);
    const humanFilterLabel = spec.exclude
      ? `${spec.flag} not in ${humanResponseType}[${spec.key}]`
      : `${spec.flag} in ${humanResponseType}[${spec.key}]`;
    super(humanFilterLabel, spec);
  }
  test (transition) {
    let responses = (this.spec.responseType !== undefined
      ? (transition[this.spec.responseType] && transition[this.spec.responseType][this.spec.key])
      : transition.dasResponse[this.spec.key]) || [];
    // There was a bug in <=v1.0.0 that stored / overrode strings instead of adding to a list
    if (!(responses instanceof Array)) {
      responses = [responses];
    }
    if (this.spec.responseType === undefined &&
        transition.etsResponse !== null &&
        transition.etsResponse[this.spec.key]) {
      if (transition.etsResponse[this.spec.key] instanceof Array) {
        responses = responses.concat(transition.etsResponse[this.spec.key]);
      } else {
        responses.push(transition.etsResponse[this.spec.key]);
      }
    }
    if (this.spec.exclude) {
      return responses.indexOf(this.spec.flag) === -1;
    } else {
      return responses.indexOf(this.spec.flag) !== -1;
    }
  }
}

export default FlagFilter;
