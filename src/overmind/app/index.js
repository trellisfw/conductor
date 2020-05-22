import state from './state'
import actions from './actions'
import config from '../../config'
import _ from 'lodash'
import urlLib from 'url'
import packagejson from '../../../package.json';

export default function (namespace) {
  return {
    onInitialize({ state, actions, effects }, instance) {
      console.log('Started app')


      // Add the package.json version to the title
      if (packagejson && packagejson.version) {
        document.title = document.title + ' - v'+packagejson.version;
      }

			let query = urlLib.parse(window.location.href, true).query;

			if (query.d) {
        console.log('Have domain in query params, using it');
        state.login.domain = query.d;
      // Populate domain from localStorage if there is a saved one:
			} else if (window.localStorage['oada:domain']) {
        console.log('Have saved domain in localStorage, using it');
        state.login.domain = window.localStorage['oada:domain'];
      }

      let skin = false;
      // Populate skin from localStorage if there is a saved one:
      if (window.localStorage['skin']) {
        console.log('Have saved skin in localStorage, using it');;
        skin = window.localStorage['skin'];
      }
      if (!config.skins || !config.skins[skin]) {
        console.log('WARNING: skin in localStorage was ',skin,', but that is not listed in config.skins');
        skin = false;
      }
      if (!skin) skin = config.skin;
      console.log('Using skin ', skin);
      // Also push skin options to state:
      state.app.skins = config.skins;
      // And select one
      state.app.skin = skin;

      //Initialize modules
      actions.examples.initialize();
      actions.partners.initialize();
    },
    state,
    actions: actions(namespace)
  }
}
