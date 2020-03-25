import _ from 'lodash';
var namespace = null;
function moduleState(state) {
  return _.get(state, namespace);
}
export default function(_namespace) {
  namespace = _namespace;
  return {
    increaseCount({ state }, test) {
      moduleState(state).count++;
    },
    decreaseCount({ state }) {
      moduleState(state).count--;
    },
    skinChange({state}, newSkin) {
      state.app.skin = newSkin;
      // Save this to localStorage to keep for next time:
      window.localStorage['skin'] = newSkin;
    }
  }
}
