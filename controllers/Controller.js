/* globals d3, less */
import { Model } from '../node_modules/uki/dist/uki.esm.js';
import Database from '../models/Database.js';
import Tooltip from '../views/Tooltip/Tooltip.js';

import recolorImageFilter from '../utils/recolorImageFilter.js';

class Controller extends Model {
  constructor () {
    super([
      { type: 'html', url: 'docs/helpDefinitions.html' }
    ]);
    this.database = new Database();

    this.tooltip = new Tooltip();

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
    await this.tooltip.render();
  }
  async finishSetup () {
    if (this._alreadyFinished) {
      return;
    }
    await this.ready;

    // Attach event listeners to inspectable fields
    const self = this;
    this.definitions = {};
    d3.select(this.resources[0])
      .selectAll('[data-inspectable]')
      .each(function () {
        self.definitions[this.dataset.inspectable] = this;
      });
    function showHelp () {
      const helpElement = self.definitions[this.innerText];
      if (helpElement && helpElement.outerHTML) {
        self.tooltip.show({
          content: helpElement.outerHTML,
          targetBounds: this.getBoundingClientRect(),
          hideAfterMs: 10000
        });
      } else {
        self.tooltip.hide();
      }
    }
    d3.selectAll('.inspectable')
      .on('mouseenter', showHelp)
      .on('click', showHelp)
      .on('touchend', function () {
        d3.event.preventDefault();
        d3.event.stopPropagation();
        showHelp.call(this);
      })
      .on('mouseleave', () => {
        self.tooltip.hide();
      })
      .each(function () {
        if (!self.definitions[this.innerText]) {
          console.warn(`No help definition for inspectable concept: ${this.innerText}`);
        }
      });

    // For small screens, collapse large horizontal panes that aren't being used
    d3.selectAll('.pageSlice')
      .classed('unfocused', (d, i) => i !== this.initialPaneIndex)
      .on('click', function () {
        const target = this;
        d3.selectAll('.pageSlice').classed('unfocused', function () {
          return this !== target;
        });
      });

    // TODO: this is an ugly patch for public / private fields, because pseudo-elements can't exist inside form fields. Move this:
    d3.selectAll('input[type="text"], input[type="email"], textarea').each(function () {
      const privacyLogo = document.createElement('img');
      this.insertAdjacentElement('afterend', privacyLogo);
      d3.select(privacyLogo)
        .classed('privacyLogo', true)
        .attr('src', d3.select(this).classed('private') ? 'img/lock.svg' : 'img/eye.svg');
    });

    this._alreadyFinished = true;
  }
}

export default Controller;
