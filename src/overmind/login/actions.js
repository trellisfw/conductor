import _ from 'lodash';
import uuid from 'uuid/v4';
import Promise from 'bluebird';
import hash from 'hash.js'

const salt = 'pY9600eU4caV';
const hashes = {
  '99629e2249b2a68da494098813b3233df4b4c84a0379193869d5a270b5f41a09': {
    token: 'god',
    name: 'Michael Gaspers'
  },
  'af6fb7848cd6f80fa3fc671b6c68769359e608b4e0b1155f3708f2621e259676': {
    token: 'aaa',
    name: 'Cyrus Bowman'
  },
}

export default {
  login({ state, actions }) {
    //Hash salt+email+pass see if it matches one of our hashes
    state.login.incorrect = false;
    state.login.loading = true;
    return Promise.delay(1000).then(() => {
      const theHash = hash.sha256().update(salt+state.login.email.toLowerCase()+state.login.password.toLowerCase()).digest('hex')
      const creds = hashes[theHash];
      if (creds == null) {
        //Show invailid login
        state.login.password = '';
        state.login.incorrect = true;
      } else {
        state.oada.token = creds.token;
        state.login.name = creds.name;
        state.login.loggedIn = true;
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
