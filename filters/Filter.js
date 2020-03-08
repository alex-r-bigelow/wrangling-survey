import IntrospectableMixin from '../utils/IntrospectableMixin.js';

class Filter extends IntrospectableMixin(Object) {
  constructor (humanLabel, spec) {
    super();
    this.humanLabel = humanLabel;
    this.spec = spec;
  }
  test (transition) {
    throw new Error('The test function should be overridden');
  }
}

export default Filter;
