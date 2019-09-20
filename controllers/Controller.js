/* globals d3, less */
import { Model } from '../node_modules/uki/dist/uki.esm.js';
import Database from '../models/Database.js';
import GlossaryView from '../views/GlossaryView/GlossaryView.js';

import recolorImageFilter from '../utils/recolorImageFilter.js';

class Controller extends Model {
  constructor () {
    super();
    this.database = new Database();

    this.glossary = new GlossaryView();

    this.initialPaneIndex = 0;

    this.database.on('update', () => { this.renderAllViews(); });
    window.onresize = () => { this.renderAllViews(); };
    (async () => {
      // Wait for LESS to finish loading before applying our SVG
      // filter hack
      await less.pageLoadFinished;
      recolorImageFilter();
    })();
  }
  async renderAllViews () {
    await this.glossary.render();
  }
  focusPane (target) {
    d3.selectAll('.pageSlice').classed('unfocused', function () {
      return this !== target;
    });
  }
  async finishSetup () {
    if (this._alreadyFinished) {
      return;
    }
    await this.ready;

    // Attach event listeners to inspectable fields
    const self = this;
    d3.selectAll('.inspectable')
      .on('click', function () {
        self.glossary.show(this.innerText);
      }).on('touchend', function () {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        self.glossary.show(this.innerText);
      });

    // For small screens, collapse large horizontal panes that aren't being used
    d3.selectAll('.pageSlice')
      .classed('unfocused', (d, i) => i !== this.initialPaneIndex)
      .on('click', function () {
        if (d3.select(this).classed('unfocused')) {
          self.focusPane(this);
          d3.event.preventDefault();
        }
      });

    // TODO: this is an ugly patch for public / private fields, because pseudo-elements can't exist inside form fields. Move this:
    d3.selectAll('input[type="text"], input[type="email"], textarea').each(function () {
      const privacyLogo = document.createElement('img');
      this.insertAdjacentElement('afterend', privacyLogo);
      d3.select(privacyLogo)
        .classed('privacyLogo', true)
        .attr('src', d3.select(this).classed('private') ? 'img/lock.svg' : 'img/eye.svg');
    });

    // Only show the conference-specific parts if the user originally used a
    // conference link

    this._alreadyFinished = true;
  }
}

export default Controller;
