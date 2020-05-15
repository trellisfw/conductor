import config from './config'
import md5 from 'md5'
import {json} from 'overmind'
import _ from 'lodash';
import templates from './templates'

export default {
  templates: templates,
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
          _.assign({}, location, {partner: partner.key })
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
  mask: (local, state) =>
    state.examples.mask
  ,
}
