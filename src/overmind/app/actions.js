import _ from 'lodash';
var namespace = null;
function moduleState(state) {
  return _.get(state, namespace);
}
export default function(_namespace) {
  namespace = _namespace;
  return {
    increaseCount({ state }, test) {
      console.log('test', test)
      moduleState(state).count++;
    },
    decreaseCount({ state }) {
      moduleState(state).count--;
    }
  }
}
