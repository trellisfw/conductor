import urlLib from 'url'
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
		let query = urlLib.parse(window.location.href, true).query;
    let token;
    try {
			if (query.t) {
        token = query.t;
        console.log(
          'token found in query parameter:' + token
        )
			} else if (window.localStorage[lsKey(state.oada.url)]) {
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
    actions.rules.initialize();
  },

  async initializeLookups({state, actions}) {
  // Get expanded list of trading partners
    let response = await actions.oada
      .get(`/bookmarks/trellisfw/trading-partners/expand-index`)
    TRADING_PARTNERS = response.data;

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
      if (docType == 'documents') {
        await actions.oada
          .watch({
            url: `/bookmarks/trellisfw/${docType}`,
            actionName: 'oada.onDocumentsChange'
          })
      } else if (docType == 'cois') {
        await actions.oada
          .watch({
            url: `/bookmarks/trellisfw/${docType}`,
            actionName: 'oada.onCOISChange'
          })
      } else if (docType == 'audits') {
        await actions.oada
          .watch({
            url: `/bookmarks/trellisfw/${docType}`,
            actionName: 'oada.onAuditsChange'
          })
      }

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
    let ref = null;
    let organization = null;
    let masterid = null;
    let holder = null;
    let tps = null;
    switch(docType) {
      case 'cois':
        if (_.get(doc, '_meta.lookups.coi') == null) return [];
        //One CoI holder to many TPs
        ref = doc._meta.lookups.coi.holder._ref;
        holder = await actions.oada.get(ref)
        tps = holder.data['trading-partners']
        tps = Object.keys(tps).map(masterid => {
          const partner = _.find(TRADING_PARTNERS, {masterid});
          if (partner) return {
            with: partner.name,
            type: 'shareWf'
          }
        })
        tps = _.compact(tps);
        return tps
      case 'fsqa-audits':
        if (_.get(doc, '_meta.lookups.fsqa-audit.organization') == null) return [];
        ref = doc._meta.lookups['fsqa-audit']['organization']._ref;
        organization = await actions.oada.get(ref)
        masterid = organization.data.masterid;
        tps = _.filter(TRADING_PARTNERS, (tp) => {
          if (tp.facilities == null) return false;
          return tp.facilities[masterid] ? true: false
        }).map((tp) => {
          if (tp) return {
            with: tp.name,
            type: 'shareWf'
          }
        });
        tps = _.compact(tps);
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
        return []
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
        console.log('Uploaded new PDF at', id);
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
            //Create a link to the new pdf in /documents
            return actions.oada
              .put({
                url: `/bookmarks/trellisfw/documents/${id}`,
                data: {
                  _id: 'resources/' + id,
                  _rev: 0
                },
                headers: {
                  'Content-Type': 'application/vnd.trellis.documents.1+json'
                }
              });
          });
      })
  },
  onDocumentsChange ({ state, actions }, response) {
    //If a key was added or changed reload that document
    console.log('onDocumentsChange', response)
    return Promise.map(_.get(response, 'change'), (change) => {
      if (_.get(change, 'type') == 'merge') {
        //Get all the keys that do not start with _
        let keys = _.filter(
          Object.keys(_.get(change, 'body')),
          key => _.startsWith(key, '_') === false
        )
        //Reload meta for all these pdfs
        return Promise.map(keys, documentId => {
          return actions.oada.loadMeta({docType: 'documents', documentId})
        })
      } else if (_.get(change, 'type') == 'delete') {
        //Remove documents with these keys
        let keys = _.filter(
          Object.keys(_.get(change, 'body')),
          key => _.startsWith(key, '_') === false
        )
        _.forEach(keys, key => {
          delete state.oada.data['documents'][key]
        })
      }
    })
  },
  onCOISChange ({ state, actions }, response) {
    //If a key was added or changed reload that document
    console.log('onCOISChange', response)
    return Promise.map(_.get(response, 'change'), (change) => {
      if (_.get(change, 'type') == 'merge') {
        //Get all the keys that do not start with _
        let keys = _.filter(
          Object.keys(_.get(change, 'body')),
          key => _.startsWith(key, '_') === false
        )
        //Reload meta for all these pdfs
        return Promise.map(keys, documentId => {
          return actions.oada.loadDocument({docType: 'cois', documentId})
        })
      } else if (_.get(change, 'type') == 'delete') {
        //Remove documents with these keys
        let keys = _.filter(
          Object.keys(_.get(change, 'body')),
          key => _.startsWith(key, '_') === false
        )
        _.forEach(keys, key => {
          delete state.oada.data['cois'][key]
        })
      }
    })
  },
  onAuditsChange ({ state, actions }, response) {
    //If a key was added or changed reload that document
    console.log('onAuditsChange', response)
    return Promise.map(_.get(response, 'change'), (change) => {
      if (_.get(change, 'type') == 'merge') {
        //Get all the keys that do not start with _
        let keys = _.filter(
          Object.keys(_.get(change, 'body')),
          key => _.startsWith(key, '_') === false
        )
        //Reload meta for all these pdfs
        return Promise.map(keys, documentId => {
          return actions.oada.loadDocument({docType: 'fsqa-audits', documentId})
        })
      } else if (_.get(change, 'type') == 'delete') {
        //Remove documents with these keys
        let keys = _.filter(
          Object.keys(_.get(change, 'body')),
          key => _.startsWith(key, '_') === false
        )
        _.forEach(keys, key => {
          delete state.oada.data['fsqa-audits'][key]
        })
      }
    })
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
              _.pick(response.data, ['stats', 'services', 'filename', '_type', 'vdoc', 'lookups'])
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
