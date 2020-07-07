import state from './state'
import actions from './actions'
import config from '../../config'
import _ from 'lodash'
import urlLib from 'url'
import packagejson from '../../../package.json';

export default function (namespace) {
  return {
    async onInitialize({ state, actions, effects }, instance) {
      console.log('Started app')

      // Add the package.json version to the title
      if (packagejson && packagejson.version) {
        document.title = document.title + ' - v'+packagejson.version;
      }

      let urlObj = urlLib.parse(window.location.href, true);
			let query = _.cloneDeep(urlObj.query);

      //Check if we have a domain in the query parameters.
      let domain = null;
			if (query.d) {
        //Use query parameters domain instead of local storage
        domain = 'https://' + query.d;
        delete urlObj.query.d;
        delete urlObj.search;
        window.history.pushState({}, document.title, urlLib.format(urlObj.format()));
        console.log('Have domain in query params, using it instead of local storage:', domain);
			} else if (window.localStorage['oada:domain']) {
        // Populate domain from localStorage if there is a saved one:
        domain = window.localStorage['oada:domain'];
        console.log('Have saved domain in localStorage, using it:', domain);
      }

      //Check if we have a token in the query parameters
      let token;
			if (query.t) {
        //Use token from url instead of local storage
        token = query.t;
        delete urlObj.query.t;
        delete urlObj.search;
        window.history.pushState({}, document.title, urlLib.format(urlObj.format()));
        console.log('Token found in query parameter, using it instead of local storage:' + token)
        state.login.dontSaveToken = true; //Don't save the login token after login
			} else if (window.localStorage['oada:'+domain+':token']) {
        //Check if we have a token in local storage
        token = window.localStorage['oada:'+domain+':token']
        console.log('Already have a token for URL ' + domain+ ', logout to clear:', token)
      } else {
        if (domain) console.log('No token found for domain', domain)
      }

      state.login.domain = domain;

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
      //If have a domain and a token, auto-login
      if (domain && token) {
        state.login.domain = domain;
        state.login.token = token;
        await actions.login.login();
      }
      //Initialize modules
      actions.examples.initialize();
      actions.partners.initialize();
    },
    state,
    actions: actions(namespace)
  }
}
