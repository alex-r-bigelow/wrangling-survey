/* globals sha256 */
import { Model } from '../node_modules/uki/dist/uki.esm.js';

class Responses extends Model {
  constructor () {
    super();
    this.initCookie();
  }
  initCookie () {
    this.cookie = window.localStorage.getItem('surveyCookie');
    if (this.cookie === null) {
      this.resetCookie();
    }
  }
  resetCookie () {
    this.cookie = sha256((new Date()).toISOString());
    window.localStorage.setItem('surveyCookie', this.cookie);
  }
  getFormValues () {
    return {
      cookie: this.cookie
    };
  }
}
export default Responses;
