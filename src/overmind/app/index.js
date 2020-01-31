import state from './state'
import actions from './actions'

export default function (namespace) {
  return {
    onInitialize({ state, actions, effects }, instance) {
      console.log('Started app')
    },
    state,
    actions: actions(namespace)
  }
}
