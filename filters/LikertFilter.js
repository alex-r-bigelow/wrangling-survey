import Filter from './Filter.js';

class LikertFilter extends Filter {
  constructor (spec) {
    const humanResponseType = window.controller
      .getHumanResponseType(spec.responseType);
    const humanFilterLabel = spec.exclude
      ? `${humanResponseType}[${spec.key}] != ${spec.value}`
      : `${humanResponseType}[${spec.key}] == ${spec.value}`;
    super(humanFilterLabel, spec);
  }
  test (transition) {
    if (this.spec.exclude) {
      if (this.spec.responseType === undefined) {
        return transition.dasResponse[this.spec.key] !== this.spec.value &&
          (transition.etsResponse === null ||
            transition.etsResponse[this.spec.key] !== this.spec.value);
      } else {
        return transition[this.spec.responseType] === null ||
          transition[this.spec.responseType][this.spec.key] !== this.spec.value;
      }
    } else {
      if (this.spec.responseType === undefined) {
        return transition.dasResponse[this.spec.key] === this.spec.value ||
          (transition.etsResponse !== null &&
            transition.etsResponse[this.spec.key] === this.spec.value);
      } else {
        return transition[this.spec.responseType] !== null &&
          transition[this.spec.responseType][this.spec.key] === this.spec.value;
      }
    }
  }
}

export default LikertFilter;
