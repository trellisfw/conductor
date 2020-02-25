import state from './state'
import actions from './actions'

export default function (namespace) {
  return {
    onInitialize({ state, actions, effects }, instance) {
      console.log('Started app')
      if (window.localStorage['oada:domain']) {
        console.log('Have saved domain in localStorage, using it');
        state.login.domain = window.localStorage['oada:domain'];
      }
    },
    state,
    actions: actions(namespace)
  }
}
