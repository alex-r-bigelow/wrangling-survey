import Filter from './Filter.js';

class SingletonFilter extends Filter {
  constructor (spec) {
    const humanResponseType = window.controller
      .getHumanResponseType(spec.responseType);
    super(`Specific response, filtered from ${humanResponseType}[${spec.key}]`, spec);
  }
  test (transition) {
    return transition.transitionId === this.spec.transitionId;
  }
}

export default SingletonFilter;
