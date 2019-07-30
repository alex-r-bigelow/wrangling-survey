import { View } from '../../node_modules/uki/dist/uki.esm.js';
import IntrospectableMixin from '../../utils/IntrospectableMixin.js';

class DomainView extends IntrospectableMixin(View) {
  constructor (div) {
    super(div, [
      { type: 'less', url: 'views/DomainView/style.less' },
      { type: 'text', url: 'views/DomainView/template.html' }
    ]);
  }
  setup () {
    this.d3el.html(this.resources[1]);

    // TODO: populate the datalist based on prior responses

    this.d3el.select('.next').on('click', () => {
      window.controller.advanceSurvey('dataType');
    });
  }
  draw () {}
}
export default DomainView;
