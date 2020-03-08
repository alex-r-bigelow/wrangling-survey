import Filter from './Filter.js';

class TermFilter extends Filter {
  constructor (spec) {
    const displayValue = spec.value === '' ? '(blank)' : spec.value;
    const humanFilterLabel = `${spec.key}[${spec.term}] == ${displayValue}`;
    super(humanFilterLabel, spec);
  }
  test (transition) {
    const transitionValue = (transition.dasResponse[this.spec.key] &&
       transition.dasResponse[this.spec.key][this.spec.term]) ||
      (transition.etsResponse !== null &&
       transition.etsResponse[this.spec.key] &&
       transition.etsResponse[this.spec.key][this.spec.term]);
    return transitionValue === this.spec.value;
  }
}

export default TermFilter;
