import Filter from './Filter.js';

class ViewFilter extends Filter {
  constructor (spec) {
    const humanFilterLabel = spec.exclude
      ? `Participants did not see ${spec.humanViewLabel}`
      : `Participants saw ${spec.humanViewLabel}`;
    super(humanFilterLabel, spec);
    this.view = window.controller.visViews.find(view => {
      return view.humanLabel === spec.humanViewLabel;
    });
  }
  test (transition) {
    if (this.spec.exclude) {
      return !this.view.filterTransition(transition);
    } else {
      return this.view.filterTransition(transition);
    }
  }
}

export default ViewFilter;
