export default {
  async login({ state, actions }) {
    let domain = state.login.domain;
    let token = state.login.token;
    state.login.loading = true;
    domain = domain.match(/^http/) ? domain : 'https://'+domain;
    await actions.oada.login({domain, token});
    state.login.loading = false;
    if (state.oada.token) {
      state.login.loggedIn = true;
      const me = await actions.oada.get('/users/me');
      state.login.name = me && me.data && me.data.username;
      // Keep track of the last-used domain URL so refresh doesn't set it back to localhost all the time:
      window.localStorage['oada:domain'] = state.oada.url;
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
