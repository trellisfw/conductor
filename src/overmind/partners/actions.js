import {json} from 'overmind'

export default {
  async getExamples({state, actions}) {
    state.partners = json(state.examples.partners)
  },

  async initialize({state, actions}) {
    actions.partners.getExamples();
  }
}
