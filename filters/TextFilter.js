import Filter from './Filter.js';

class TextFilter extends Filter {
  constructor (spec) {
    const humanResponseType = window.controller
      .getHumanResponseType(spec.responseType);
    const displayValue = spec.value === '' ? '(blank)' : spec.value;
    const humanFilterLabel = `${humanResponseType}[${spec.key}] == ${displayValue}`;
    super(humanFilterLabel, spec);
  }
  test (transition) {
    return this.spec.responseType !== undefined
      ? (transition[this.spec.responseType] && transition[this.spec.responseType][this.spec.key] === this.spec.value)
      : transition.dasResponse[this.spec.key] === this.spec.value ||
        (transition.etsResponse &&
         transition.etsResponse[this.spec.key] === this.spec.value);
  }
}

export default TextFilter;
