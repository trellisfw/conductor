import _ from 'lodash';
import uuid from 'uuid/v4';
import Promise from 'bluebird';
import hash from 'hash.js'
import addressbar from 'addressbar';
import config from '../../config';

export default {
  login({ state, actions }) {
    //Hash salt+email+pass see if it matches one of our hashes
    state.login.incorrect = false;
    state.login.loading = true;
    return Promise.delay(1000).then(() => {
      const theHash = hash.sha256().update(config.login.salt+state.login.email.toLowerCase()+state.login.password.toLowerCase()).digest('hex')
      const creds = config.login.hashes[theHash];
      if (creds == null) {
        //Show invailid login
        state.login.password = '';
        state.login.incorrect = true;
      } else {
        state.oada.token = creds.token;
        state.login.name = creds.name;
        state.login.loggedIn = true;
        console.log(addressbar.value)
        //addressbar.value = addressbar.value + '/files';
        actions.oada.login();
      }
      state.login.loading = false;
    })
  },
  logout({ state, actions }) {
    state.login.password = '';
    state.login.loggedIn = false;
  },
  passwordChange({ state }, data) {
    state.login.password = data.value;
  },
  emailChange({ state }, data) {
    state.login.email = data.value;
  }
}
