import config from './config'
import md5 from 'md5'
import {json} from 'overmind'
import _ from 'lodash';

const FL_BUSINESS_ID = config.get('fl_business_id')

export default {
  templates: {
    temp0: {
      id: 'temp0',
      text: "When an Audit from input0 has a location of input1 and a product of input2, sync it to Food LogiQ.",
      input0: {
        text: 'Partner',
        type: 'partners',
        values: [],
      },
      input1: {
        text: 'Location',
        type: 'locations',
        values: [],
      },
      input2: {
        text: 'Product',
        type: 'products',
        values: [],
      },
      categories: ['FSQA', 'PII'],
      share: {
        type: 'fl',
        partners: 'input0',
        locations: 'input1',
        products: 'input2', 
        shares: {
          [FL_BUSINESS_ID]: {
            communities: []
          }
        }
      }
    },
    temp1: {
      id: 'temp1',
      text: "When an Audit from input0 has a location of input1 and a product of input2, sync it to IBM Food Trust.",
      input0: {
        text: 'Partner',
        type: 'partners',
        values: [],
      },
      input1: {
        text: 'Location',
        type: 'locations',
        values: [],
      },
      input2: {
        text: 'Product',
        type: 'products',
        values: [],
      },
      categories: ['FSQA', 'PII'],
      share: {
        type: 'ift',
        partners: 'input0',
        locations: 'input1',
        products: 'input2', 
      }
    },
    temp2: {
      id: 'temp2',
      text: "When an Audit has a location of input0 and a product of input1, email it to input2.",
      input0: {
        text: 'Location',
        type: 'locations',
        values: [],
      },
      input1: {
        text: 'Product',
        type: 'products',
        values: [],
      },
      input2: {
        text: 'Email',
        type: 'emails',
        values: [],
      },
      categories: ['FSQA', 'PII'],
      share: {
        type: 'email',
        locations: 'input0',
        products: 'input1', 
        emails: 'input2',
      }
    },
  },
  rules: {},
  partners: (local, state) =>
    _.keyBy(
      _.keys(state.partners)
      .map(k => ({name: k}))
      .map(obj =>
        _.assign(obj, {key: md5(JSON.stringify(obj))})
      )
    ,'key')
  ,

  documents: (local, state) => 
    state.examples.documents,

  locations: (local, state) =>
    _.keyBy(
      _.chain(state.partners)
      .map(partner =>
        _.values(partner.locations || {}).map(location => 
          _.assign({}, location, {partner})
        ).map(location =>
          _.assign(location, {key: md5(JSON.stringify(location))})
        )
      )
      .flatten()
      .compact()
      .value()
    , 'key')
  ,
  products: (local, state) => state.examples.products,
  emails: (local, state) => 
    _.keyBy(
      _.chain(state.partners)
      .map(partner => partner.email)
      .compact()
      .map(name => ({name}))
      .map(obj =>
        _.assign(obj, {key: md5(JSON.stringify(obj))})
      )
      .value()
    , 'key')
  ,
}
