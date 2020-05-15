import _ from 'lodash'
import Promise from 'bluebird'
import request from 'axios'
import config from '../../config'
import { browser as oadaIdClient } from '@oada/oada-id-client/index.js'

const getAccessToken = Promise.promisify(oadaIdClient.getAccessToken)

const lsKey = url => 'oada:' + url + ':token' // handy function to make a useful localStorage key

let DOC_TYPES = ['cois', 'fsqa-certificates', 'fsqa-audits', 'letters-of-guarantee', 'documents'];
let COI_HOLDERS = {};
let TRADING_PARTNERS = {};
let FACILITIES = {};

export default {
  async logout ({ state, effects }) {
    await effects.oada.websocket.close()
    //Clear documents
    state.oada.data = {}
    delete window.localStorage[lsKey(state.oada.url)]
  },
  async login ({ state, actions }) {
    /*
      Connect to my OADA instance
    */
    let token;
    try {
      if (window.localStorage[lsKey(state.oada.url)]) {
        console.log(
          'Already have a token for URL ' + state.oada.url + ', logout to clear'
        )
        token = window.localStorage[lsKey(state.oada.url)]
      } else {
        // If we don't have a token stored from last time, we'll need to
        // redirect browser to ask for one
        console.log('Do not have an access token, redirecting...')
        let res = await getAccessToken(state.oada.url.replace(/^https?:\/\//, ''), {
          metadata: config.oada.devcert,
          scope: 'all:all',
          redirect: config.oada.redirect
        })
        token = res.access_token
      }
    } catch (err) {
      state.login.error =
        'Failed to redirect to ' + state.oada.url + ' for connection'
      console.log('FAILED TO GET ACCESS TOKEN: err = ', err)
      token = false;
    }

    // Have a token now, make sure it's saved to localStorage until we logout:
    if (token) window.localStorage[lsKey(state.oada.url)] = token
    state.oada.token = token
    console.log(token);
    console.log('Have token, connecting to oada...')
    let result = await actions.oada.connect()
    console.log('Websocket connected, checking resources...')

    actions.oada.initializeLookups();
    actions.oada.initializeDocuments();
    actions.rules.initialize()
  },

  async initializeLookups({state, actions}) {
  // Get expanded list of trading partners
    let response = await actions.oada
      .get(`/bookmarks/trellisfw/trading-partners/expand-index`)
    let TRADING_PARTNERS = response.data

  // Get expanded list of coi-holders
    response = await actions.oada
      .get(`/bookmarks/trellisfw/trading-partners/expand-index`)
    COI_HOLDERS = response.data;

    response = await actions.oada
      .get(`/bookmarks/trellisfw/facilities/expand-index`)
    FACILITIES = response.data;
  },

  async initializeDocuments({state, actions}) {
   //Create /trellisfw if it does not exist
    let exists = await actions.oada
      .doesResourceExist('/bookmarks/trellisfw')
    if (!exists) {
      console.log('/bookmarks/trellisfw does not exist.  Creating...')
      //Create /trellisfw
      await actions.oada.createAndPutResource({
        url: '/bookmarks/trellisfw',
        data: {}
      })
    }

    //Create document endpoints if they do not exist
    DOC_TYPES.forEach(async (docType) => {

      state.oada.data[docType] = {}

      exists = await actions.oada
        .doesResourceExist(`/bookmarks/trellisfw/${docType}`)
      if (!exists) {
        //Create documents
        await actions.oada.createAndPutResource({
          url: `/bookmarks/trellisfw/${docType}`,
          data: {},
          contentType: `application/vnd.trellis.${docType}.1+json`
        })
      }

      console.log('Setting watches...')
      //Watch for changes to /trellisfw/documents
      //TODO: with multiple document types we need multiple watches; can't just watch /bookmarks/trellisfw because there
      // are many other keys with changes being made at that level
      // need to figure out how to pluck docType out of responses
      await actions.oada
        .watch({
          url: `/bookmarks/trellisfw/${docType}`,
          actionName: 'oada.onDocumentsChange'
        })

      //Get all the documents ids in /trellisfw/documents
      let response = await actions.oada
        .get(`/bookmarks/trellisfw/${docType}`)
      let docKeys = _.filter(
        Object.keys(response.data),
        key => _.startsWith(key, '_') === false
      )

      //Save space for documents
      _.forEach(docKeys, (key) => {
        state.oada.data[docType][key] = null;
      })
    })

  },

  async getTradingPartners({state, actions}, {docType, documentKey}) {
    let doc = state.oada.data[docType][documentKey];
    switch(docType) {
      case 'cois':
        //One CoI holder to many TPs
        let ref = doc._meta.lookups.coi.holder._ref;
        let holder = await actions.oada.get(ref)
        let tps = holder.data['trading-partners']
        tps = Object.keys(tps).map(masterid =>
          _.find(TRADING_PARTNERS, {masterid}))
          .map(tp => tp.name)

        return tps
      case 'fsqa-audits':
        ref = doc._meta.lookups['fsqa-audit']['organization']._ref;
        let organization = await actions.oada.get(ref)
        let masterid = organization.data.masterid;

        tps = _.filter(TRADING_PARTNERS, (tp) => {
          return tp.facilities[masterid] ? true: false
        }).map(tp => tp.name)

        return tps;

      case 'fsqa-certificates':
        ref = doc._meta.lookups['fsqa-audit']['organization']._ref;
        organization = await actions.oada.get(ref)
        masterid = organization.data.masterid;

        tps = _.filter(TRADING_PARTNERS, (tp) => {
          return tp.facilities[masterid] ? true: false
        }).map(tp => tp.name)

        return tps;
      case 'letters-of-guarantee':

      case 'documents':
        return []
    }
  },
  uploadFile ({ state, actions }, file) {
    //Add file to the file list, flag it as `uploading`
    //Create the pdf
    return request
      .request({
        url: '/resources',
        method: 'post',
        baseURL: state.oada.url,
        headers: {
          Authorization: 'Bearer ' + state.oada.token,
          'Content-Disposition': 'inline',
          'Content-Type': file.type
        },
        data: file
      })
      .then(response => {
        //Pull out location of pdf and link it to the document under the 'pdf' key
        var id = response.headers['content-location'].split('/')
        id = id[id.length - 1]
        //Add filename info to the pdf
        return actions.oada
          .put({
            url: `/resources/${id}/_meta`,
            data: {
              filename: file.name
            },
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(() => {
            //Create a document with a `pdf` key linking the pdf, and link the document to `documents`
            return actions.oada.createAndPostResource({
              url: '/bookmarks/trellisfw/documents',
              data: {
                pdf: {
                  _id: 'resources/' + id,
                  _rev: 0
                }
              }
            })
          })
      })
  },
  onDocumentsChange ({ state, actions }, response) {
    //If a key was added or changed reload that document
    console.log('onDocumentsChange', response)
    //Check if change was a merge
    if (_.get(response, 'change.type') == 'merge') {
      //Get all the keys that do not start with _
      let keys = _.filter(
        Object.keys(_.get(response, 'change.body')),
        key => _.startsWith(key, '_') === false
      )
      // TODO: Fix this. Parse out of watch path
      let docType = 'documents';
      console.log('ONDOCUMENTSCHANGE', response)
      //If these keys are links, then load them as documents
      return Promise.map(keys, documentId => {
        return actions.oada.loadDocument({docType, documentId})
      })
    } else if (_.get(response, 'change.type') == 'delete') {
      //Get all the keys that do not start with _
      let keys = _.filter(
        Object.keys(_.get(response, 'change.body')),
        key => _.startsWith(key, '_') === false
      )
      //If these keys are links, then load them as documents
      //TODO: fix this -- watch should just specify the docType when its setup under the payload key
      console.log(response);
      let docType = 'documents'
      _.forEach(keys, key => {
        delete state.oada.data[docType][key]
      })
    }
  },
  loadMeta ({ state, actions }, {documentId, docType}) {
    let path = `/bookmarks/trellisfw/${docType}/${documentId}`;
    return actions.oada
      .get(path+`/_meta`)
      .then(response => {
        if (response == null) throw Error('No meta data for ' + documentId)
        const orgMeta = _.get(state.oada.data, `${docType}.${documentId}._meta`)
        const newMeta = _.merge(
          {},
          orgMeta,
          _.pick(response.data, ['stats', 'services', 'filename', '_type', 'vdoc'])
        )
        //Merge in stats and services
        _.set(state.oada.data, `${docType}.${documentId}._meta`, newMeta);
      }).catch(err => {
        console.log('Error. Failed to load document _meta', documentId)
      });
  },
  loadDocument ({ state, actions }, {documentId, docType}) {
    console.log('LOADDOC', docType, documentId);
    let path = `/bookmarks/trellisfw/${docType}/${documentId}`;
    return actions.oada
      .get(path)
      .then(response => {
        if (response == null) throw Error('No data for ' + documentId)
        //If doc already exists merge in data
        const orgData = _.get(state.oada.data, `${docType}.${documentId}`) || {}
        _.set(state.oada.data, `${docType}.${documentId}`, _.merge(
          {},
          orgData,
          response.data
        ));
      }).catch(err => {
        console.log('Error. Failed to load document', documentId)
      }).then(() => {
        //Load the _meta for this document
        return actions.oada
          .get(path+`/_meta`)
          .then(response => {
            if (response == null) throw Error('No meta data for ' + documentId)
            const orgMeta = _.get(state.oada.data, `${docType}.${documentId}._meta`)
            const newMeta = _.merge(
              {},
              orgMeta,
              _.pick(response.data, ['stats', 'services', 'filename', '_type', 'vdoc'])
            )
            //Merge in stats and services
            _.set(state.oada.data, `${docType}.${documentId}._meta`, newMeta);
          })
      }).catch(err => {
        console.log('Error. Failed to load document _meta', documentId)
      });
  },
  createAndPostResource ({ actions }, { url, data, contentType }) {
    return actions.oada.createResource({ data, contentType }).then(response => {
      //Link this new resource at the url provided
      var id = response.headers['content-location'].split('/')
      id = id[id.length - 1]
      return actions.oada
        .post({
          url: url,
          headers: {
            'Content-Type': contentType || 'application/json'
          },
          data: {
            _id: 'resources/' + id,
            _rev: 0
          }
        })
        .then(response => {
          var id = response.headers['content-location'].split('/')
          id = id[id.length - 1]
          return id
        })
    })
  },
  createAndPostResourceHTTP ({ actions }, { url, data, contentType }) {
    return actions.oada
      .createResourceHTTP({ data, contentType })
      .then(response => {
        //Link this new resource at the url provided
        var id = response.headers['content-location'].split('/')
        id = id[id.length - 1]
        return actions.oada
          .postHTTP({
            url: url,
            headers: {
              'Content-Type': contentType || 'application/json'
            },
            data: {
              _id: 'resources/' + id,
              _rev: 0
            }
          })
          .then(response => {
            var id = response.headers['content-location'].split('/')
            id = id[id.length - 1]
            return id
          })
      })
  },
  createAndPutResource ({ actions }, { url, data, contentType }) {
    return actions.oada.createResource({ data, contentType }).then(response => {
      //Link this new resource at the url provided
      var id = response.headers['content-location'].split('/')
      id = id[id.length - 1]
      return actions.oada.put({
        url,
        headers: {
          'Content-Type': contentType || 'application/json'
        },
        data: {
          _id: 'resources/' + id,
          _rev: 0
        }
      })
    })
  },
  createResource ({ actions }, { data, contentType }) {
    var headers = {}
    headers['content-type'] = contentType || 'application/json'
    return actions.oada.post({ url: '/resources', data, headers })
  },
  createResourceHTTP ({ actions }, { data, contentType }) {
    var headers = {}
    headers['content-type'] = contentType || 'application/json'
    return actions.oada.postHTTP({ url: '/resources', data, headers })
  },
  doesResourceExist ({ actions }, url) {
    return actions.oada
      .head(url)
      .then(response => {
        if (response != null) return true
        return false
      })
      .catch(error => {
        if (error.response && error.response.status === 404) return false
        throw error
      })
  },
  connect ({ state, effects }) {
    return effects.oada.websocket.connect(state.oada.url)
  },
  get ({ effects, state }, url) {
    return effects.oada.websocket.http({
      method: 'GET',
      url: url,
      headers: {
        Authorization: 'Bearer ' + state.oada.token
      }
    })
  },
  head ({ effects, state }, url) {
    return effects.oada.websocket.http({
      method: 'HEAD',
      url: url,
      headers: {
        Authorization: 'Bearer ' + state.oada.token
      }
    })
  },
  post ({ effects, state }, { url, headers, data }) {
    return effects.oada.websocket.http({
      method: 'POST',
      url: url,
      headers: _.merge(
        {
          Authorization: 'Bearer ' + state.oada.token
        },
        headers
      ),
      data: data
    })
  },
  postHTTP ({ effects, state }, { url, headers, data }) {
    return request.request({
      url: url,
      method: 'post',
      baseURL: state.oada.url,
      headers: _.merge(
        {
          Authorization: 'Bearer ' + state.oada.token
        },
        headers
      ),
      data: data
    })
  },
  del ({ effects, state }, {url, headers, data }) {
    return effects.oada.websocket.http({
      method: 'DELETE',
      url: url,
      headers: _.merge(
        {
          Authorization: 'Bearer ' + state.oada.token
        },
        headers
      ),
      data: data
    })

  },
  put ({ effects, state }, { url, headers, data }) {
    return effects.oada.websocket.http({
      method: 'PUT',
      url: url,
      headers: _.merge(
        {
          Authorization: 'Bearer ' + state.oada.token
        },
        headers
      ),
      data: data
    })
  },
  watch ({ effects, actions, state }, { url, actionName }) {
    var cb = function callback (data) {
      var action = _.get(actions, actionName)
      action(data)
    }
    return effects.oada.websocket.watch(
      {
        url,
        headers: { Authorization: 'Bearer ' + state.oada.token }
      },
      cb
    )
  }
}
