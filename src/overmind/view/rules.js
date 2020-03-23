import _ from 'lodash';
import uuid from 'uuid/v4';
import Promise from 'bluebird';
import locationRule from './location.rule.js';
export default {
  Pages: {
    addRule({state, actions}) {
      let rule = state.view.Modals.NewRuleModal;

      let schema = locationRule;

      let postResponse = actions.oada.post({
        url: `${state.oada.url}/resources`,
        data: schema,
      })
      let _id = postResponse.headers['content-location'].replace(/^\//, '');
      let putResponse = actions.oada.put({
        url: `${state.oada.url}/bookmarks/ainz/rules`,
        data: {
          _id,
          _rev: 0,
        },
      })
    }
  }
}
