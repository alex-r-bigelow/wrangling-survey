import ConsentView from './views/ConsentView/ConsentView.js';

class Controller {
  constructor () {
    this.views = {
      ConsentView: new ConsentView()
    };
    window.onresize = () => { this.renderAllViews(); };
  }
  renderAllViews () {
    for (const view of Object.values(this.views)) {
      view.render();
    }
  }
}

window.controller = new Controller();
