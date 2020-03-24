import {shareToRules} from './shareRule';
import md5 from 'md5'
import {json} from 'overmind'
import _ from 'lodash';
import config from './config'

const SHARES_PATH = config.get('shares_path')

async function processShare(state, rule, share) {
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

  return share
}

export default {
  async putShare({state, actions}, share) {
   let id = md5(JSON.stringify(share));
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

  async createShare({state, actions}) {
    let rule = json(state.view.Modals.NewRuleModal.Edit.rule);
    let share = rule.share;
    if (share.partners) {
      let partners = rule[share.partners].values;
      delete share.partners;
      partners.forEach(async (partner) => {
        let newShare = _.cloneDeep(share);
        newShare.partner = partner;
        newShare = await processShare(state, rule, newShare);
        console.log(newShare);
//        await actions.rules.putShare(newShare);
      })
    } else {
      let newShare = _.cloneDeep(share);
      newShare = await processShare(state, rule, newShare);
      console.log(newShare);
//      await actions.rules.putShare(newShare);
    }
  },
  async loadShares({state, actions}) {
   let response = await actions.oada.get(SHARES_PATH);
    Object.keys(response.data).filter(key => key.charAt(0) !== '_').forEach(async (key) => {
      let shareResponse = await actions.oada.get(`${SHARES_PATH}/${key}`);
      actions.rules.mapShare({key, share: shareResponse.data});
    })
  },

  async initialize({state, actions}) {
  //  await actions.rules.loadShares();
  },

  locationStringsFromShare({state, actions}, share) {
    console.log(share)
    return share.locations.map((location) => 
      (_.find(state.rules.Location, location)).name
    )
  },

  async mapShare({state, actions}, obj) {
    let key = obj.key;
    let share = obj.share;
    if (share.type === 'ift') {
      share['input0'] = {
        type: 'Partner',
        values: [share.partner]
      }
      share['input1'] = {
        type: 'Location',
        values: actions.rules.locationStringsFromShare(share),
      }
      share['input2'] = {
        type: 'Product',
        values: share.products,
      }
      state.rules.rules[key] = share;
    }
    if (share.type === 'fl') {
      share['input0'] = {
        type: 'Partner',
        values: [share.partner]
      }
      share['input1'] = {
        type: 'Location',
        values: actions.rules.locationStringsFromShare(share),
      }
      share['input2'] = {
        type: 'Product',
        values: share.products,
      }
      state.rules.rules[key] = share;
    }
    if (share.type === 'email') {
      share['input0'] = {
        type: 'Location',
        values: actions.rules.locationStringsFromShare(share),
      }
      share['input1'] = {
        type: 'Product',
        values: share.products,
      }
      share['input2'] = {
        type: 'Email',
        values: share.emails
      }
      state.rules.rules[key] = share;
    }
  }
}
