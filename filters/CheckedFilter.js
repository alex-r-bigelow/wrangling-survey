import Filter from './Filter.js';

class CheckedFilter extends Filter {
  constructor (spec) {
    const humanResponseType = window.controller
      .getHumanResponseType(spec.responseType);
    const humanFilterLabel = spec.exclude
      ? `Did not check ${spec.checkedValue} for ${humanResponseType}[${spec.key}]`
      : `Checked ${spec.checkedValue} for ${humanResponseType}[${spec.key}]`;
    super(humanFilterLabel, spec);
  }
  test (transition) {
    if (this.spec.exclude) {
      return this.responseType === undefined
        ? transition.dasResponse[this.spec.key] !== this.spec.checkedValue &&
          (transition.etsResponse === null ||
           transition.etsResponse[this.spec.key] !== this.spec.checkedValue)
        : transition[this.spec.responseType][this.spec.key] !== this.spec.checkedValue;
    } else {
      return this.responseType === undefined
        ? transition.dasResponse[this.spec.key] === this.spec.checkedValue ||
          (transition.etsResponse !== null &&
           transition.etsResponse[this.spec.key] === this.spec.checkedValue)
        : transition[this.spec.responseType][this.spec.key] === this.spec.checkedValue;
    }
  }
}

export default CheckedFilter;
