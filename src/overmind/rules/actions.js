import {shareToRules} from './shareRule';
import config from './config'

const TOKEN = config.get('token')
const DOMAIN = config.get('domain')
const RULES_PATH = config.get('rules_path')
const RULES_TREE = config.get('rules_tree')
const DOCUMENTS_TREE = config.get('documents_tree')
const TASKS_TREE = config.get('tasks_tree')

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

  async createRule ({state, actions}) {
    let share = state.view.Modals.NewRuleModal.Edit.rule;
    console.log('createRule share', state.view.Modals.NewRuleModal.Edit.rule.share);
    let rules = await shareToRules(share);
    console.log('createRule rules', rules);
    for (const rule of rules) {
//      await actions.rules.ensureJobQueue(rule.destination);
      console.log('rule', rule, RULES_PATH+'/'+rule.id)
//      await actions.rules.putRule(rules);
    }
    
  },

}
