export default {
  async login({ state, actions }) {
    let domain = state.login.domain;
    let token = state.login.token;
    state.login.loading = true;
    domain = domain.match(/^http/) ? domain : 'https://'+domain;

    //Connect to oada, getting token if we don't have one
    //TODO catch error (if oada server is down)
    await actions.oada.connect({domain, token});

    //See if our token is correct (can we get /users/me)
    if (state.oada.token) {
      let me = await actions.oada.get('/users/me')
      if (me.error) {
        const err = me.error;
        state.login.loading = false;
        if (me.error.response && me.error.response.status === 401) {
          //Token no longer valid. Logout
          console.log('Token no longer valid. Logging out.')
          await actions.login.logout();
        } else {
          throw err;
        }
        state.login.loading = false;
      } else {
        state.login.loading = false;
        state.login.name = me && me.data && me.data.username;
        // Keep track of the last-used domain URL so refresh doesn't set it back to localhost all the time:
        window.localStorage['oada:domain'] = state.oada.url;
        await actions.oada.initialize()
        state.login.loggedIn = true;
      }
    }
  },
  async logout({ state, actions }) {
    await actions.oada.logout();
    state.login.loggedIn = false;
  },
  domainChange({ state }, data) {
    state.login.domain = data.value;
  }
}
