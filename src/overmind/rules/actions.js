import {shareToRules} from './shareRule';
import {json} from 'overmind'
import _ from 'lodash';
import config from './config'

const TOKEN = config.get('token')
const DOMAIN = config.get('domain')
const RULES_PATH = config.get('rules_path')
const RULES_TREE = config.get('rules_tree')
const DOCUMENTS_TREE = config.get('documents_tree')
const TASKS_TREE = config.get('tasks_tree')

async function processShare(state, rule, share) {
  let partner = share.partner;
  let partnerObj = json(state.partners[partner]);
  console.log(partner);

  if (share.products) {
    share.products = rule[share.products].values;
    let newProducts = _.cloneDeep(share.products);
    share.products.forEach((p) => {newProducts.push(p.toLowerCase())})
  }

  if (share.locations) {
    let locations = rule[share.locations].values;
    console.log('partner', partnerObj);
    share.locations = locations.map((l) => partnerObj.locations[l]);
  }

  if (share.email) {
    share.email = partnerObj.email
  }

  return share
}

export default {
  async ensureJobQueue({state, actions}, destination) {
    console.log(destination);

    let putesponse = await actions.oada.put({
      
    })

  },

  async putRule({state, actions}, rule) {
   let path = `${RULES_PATH}/${rule.id}`;

    console.log('PUTRULE', path)

    let deleteResponse = await actions.oada.delete({
      headers: { 'Content-Type': 'application/vnd.oada.ainz.rule.1+json' },
      url: path
    })

   let postResponse = await actions.oada.post({
      headers: { 'Content-Type': 'application/vnd.oada.ainz.rule.1+json' },
      url: `/resources`,
      data: rule
    })

    let _id = postResponse.headers['content-location'].replace(/^\//, '');

    console.log('sending this:', {
      headers: { 'Content-Type': 'application/vnd.oada.ainz.rule.1+json' },
      url: path,
      data: {_id, _rev: 0}
    })

    let putResponse = await actions.oada.put({
      headers: { 'Content-Type': 'application/vnd.oada.ainz.rule.1+json' },
      url: path,
      data: {_id, _rev: 0}
    })
    return
  },

  async createRules({state, actions}) {
    let rule = json(state.view.Modals.NewRuleModal.Edit.rule);
    let share = rule.share;
    let partners = rule[share.partners].values;
    console.log(share);
    delete share.partners;
    partners.forEach(async (partner) => {
      let newShare = _.cloneDeep(share);
      newShare.partner = partner;
      newShare = await processShare(state, rule, newShare);
      console.log('createRule share', newShare);
      let rules = await shareToRules(newShare);
      console.log('createRule rules', rules);
      for (const rule of rules) {
  //      await actions.rules.ensureJobQueue(rule.destination);
        console.log('rule', rule, RULES_PATH+'/'+rule.id)
  //      await actions.rules.putRule(rules);
      }
    })
  }
}
