import {shareToRules} from './shareRule';
import md5 from 'md5'
import {json} from 'overmind'
import _ from 'lodash';
import config from './config'

const pattern = /(input[0-9]+)/;

const SHARES_PATH = config.get('shares_path')

function processShare(state, rule, share) {
  share.text = rule.text;

  if (share.products) {
    share.products = rule[share.products].values;
  }

  if (share.locations) {
    share.locations = rule[share.locations].values;
  }

  if (share.emails) {
    share.emails = rule[share.emails].values;
  }

  if (share.partners) {
    share.partners = rule[share.partners].values;
  }

  return share
}

export default {
  async putShare({state, actions}, share) {
   let id = md5(JSON.stringify(share));
   share.key = id;
   let path = `${SHARES_PATH}/${id}`;


   let resource = await actions.oada.put({
      headers: { 'Content-Type': 'application/vnd.oada.ainz.rule.1+json' },
      url: `/resources/${id}`,
      data: share,
    })

    let _id = resource.headers['content-location'].replace(/^\//, '');

    let putResponse = await actions.oada.put({
      headers: { 'Content-Type': 'application/vnd.oada.ainz.rule.1+json' },
      url: path,
      data: {_id, _rev: 0}
    })
    return
  },

  async deleteShare({state, actions}) {
    let key = state.view.Modals.NewRuleModal.Edit.key;
    let path = `${SHARES_PATH}/${key}`;
    let response = await actions.oada.del({
      headers: { 'Content-Type': 'application/vnd.oada.ainz.rule.1+json' },
      url: path,
    })
  },

  async createShare({state, actions}) {
    let rule = json(state.view.Modals.NewRuleModal.Edit.rule);
    let share = rule.share;
    let newShare = _.cloneDeep(share);
    newShare = processShare(state, rule, newShare);
    await actions.rules.putShare(newShare);
  },

  async loadShares({state, actions}) {
    let response = await actions.oada.get(SHARES_PATH);
    Object.keys(response.data)
      .filter(key => key.charAt(0) !== '_')
      .forEach(async (key) => {
        let shareResponse = await actions.oada.get(`${SHARES_PATH}/${key}`);
        if (shareResponse.data) actions.rules.mapShare({key, share: shareResponse.data});
      })
  },

  async initialize({state, actions}) {
    await actions.rules.loadShares();
  },

  locationStringsFromShare({state, actions}, share) {
    return share.locations.map((location) =>
      (_.find(state.rules.Location, location)).name
    )
  },

  async mapShare({state, actions}, obj) {
    // Get the template and apply the share to it
    let key = obj.key;
    let share = obj.share;
    let templateId = share.template;
    let template = json(state.rules.templates[templateId]);
    let rule = _.cloneDeep(template);

    // Fill out the inputs
    _.keys(template.share).filter(key =>
//      /^input/.test(template.share[key])
      pattern.test(template.share[key])
    ).forEach(key => {
      rule[template.share[key]].values = share[key]
    })
    rule.key = share.key;

    // Set the state
    state.rules.rules[key] = rule;
  }
}
