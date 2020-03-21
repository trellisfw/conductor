export default {
  async login({ state, actions }) {
    state.login.loading = true;
    state.oada.url = state.login.domain.match(/^http/) ? state.login.domain : 'https://'+state.login.domain;
    await actions.oada.login();
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
