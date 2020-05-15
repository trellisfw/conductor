import _ from 'lodash'
import Promise from 'bluebird'
import request from 'axios'
import config from '../../config'
import { browser as oadaIdClient } from '@oada/oada-id-client/index.js'

const getAccessToken = Promise.promisify(oadaIdClient.getAccessToken)

const lsKey = url => 'oada:' + url + ':token' // handy function to make a useful localStorage key

let DOC_TYPES = ['cois', 'fsqa-certificates', 'fsqa-audits', 'letters-of-guarantee', 'documents'];

export default {
  async logout ({ state, effects }) {
    await effects.oada.websocket.close()
    //Clear documents
    state.oada.data.documents = {}
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

    actions.rules.initialize()
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
      //If these keys are links, then load them as documents
      return Promise.map(keys, documentId => {
        return actions.oada.loadDocument(documentId)
      })
    } else if (_.get(response, 'change.type') == 'delete') {
      //Get all the keys that do not start with _
      let keys = _.filter(
        Object.keys(_.get(response, 'change.body')),
        key => _.startsWith(key, '_') === false
      )
      //If these keys are links, then load them as documents
      _.forEach(keys, key => {
        delete state.oada.data.documents[key]
      })
    }
  },
  loadDocument ({ state, actions }, documentId) {
    return actions.oada
      .get('/bookmarks/trellisfw/documents/' + documentId)
      .then(response => {
        //If doc already exists merge in data
        const orgData = state.oada.data.documents[documentId] || {}
        state.oada.data.documents[documentId] = _.merge(
          {},
          orgData,
          response.data
        )
        //Load the _meta for this document
        return actions.oada
          .get(`/bookmarks/trellisfw/documents/${documentId}/_meta`)
          .then(response => {
            if (response == null) throw Error('No data')
            const orgMeta = state.oada.data.documents[documentId]._meta
            //Merge in status and services
            state.oada.data.documents[documentId]._meta = _.merge(
              {},
              orgMeta,
              _.pick(response.data, ['stats', 'services'])
            )
          })
          .catch(err => {
            console.log('Error. Failed to load document _meta', documentId)
          })
          .then(() => {
            //Load the meta for the pdf of this doc
            if (state.oada.data.documents[documentId].pdf != null) {
              return actions.oada
                .get(`/bookmarks/trellisfw/documents/${documentId}/pdf/_meta`)
                .then(response => {
                  if (response == null) throw Error('No data')
                  const orgMeta =
                    state.oada.data.documents[documentId].pdf._meta || {}
                  state.oada.data.documents[documentId].pdf._meta = _.merge(
                    {},
                    orgMeta,
                    _.pick(response.data, ['filename'])
                  )
                })
                .catch(err => {
                  console.log('Error. Failed to load pdf _meta', documentId)
                })
            }
          })
          .then(() => {
            //Load the audit info for this document if it exists
            if (state.oada.data.documents[documentId].audits != null) {
              return Promise.map(
                _.keys(state.oada.data.documents[documentId].audits),
                auditKey => {
                  return actions.oada
                    .get(
                      `/bookmarks/trellisfw/documents/${documentId}/audits/${auditKey}`
                    )
                    .then(response => {
                      if (response == null) throw Error('No data')
                      const orgAudit =
                        state.oada.data.documents[documentId].audits[
                          auditKey
                        ] || {}
                      state.oada.data.documents[documentId].audits[
                        auditKey
                      ] = _.merge({}, orgAudit, response.data)
                    })
                    .catch(err => {
                      console.log(
                        'Error. Failed to load audit ',
                        auditKey,
                        'from doc',
                        documentId
                      )
                    })
                }
              )
            }
          })
          .then(() => {
            //Load the masked audit info for this document if it exists
            if (
              state.oada.data.documents[documentId]['audits-masked'] != null
            ) {
              return Promise.map(
                _.keys(state.oada.data.documents[documentId]['audits-masked']),
                auditKey => {
                  return actions.oada
                    .get(
                      `/bookmarks/trellisfw/documents/${documentId}/audits-masked/${auditKey}`
                    )
                    .then(response => {
                      if (response == null) throw Error('No data')
                      const orgAudit =
                        state.oada.data.documents[documentId]['audits-masked'][
                          auditKey
                        ] || {}
                      state.oada.data.documents[documentId]['audits-masked'][
                        auditKey
                      ] = _.merge({}, orgAudit, response.data)
                    })
                    .catch(err => {
                      console.log(
                        'Error. Failed to load audit ',
                        auditKey,
                        'from doc',
                        documentId
                      )
                    })
                }
              )
            }
          })
          .then(() => {
            //Load the cois info for this document if it exists
            if (state.oada.data.documents[documentId].cois != null) {
              return Promise.map(
                _.keys(state.oada.data.documents[documentId].cois),
                coiKey => {
                  return actions.oada
                    .get(
                      `/bookmarks/trellisfw/documents/${documentId}/cois/${coiKey}`
                    )
                    .then(response => {
                      if (response == null) throw Error('No data')
                      const orgCoi =
                        state.oada.data.documents[documentId].cois[coiKey] || {}
                      state.oada.data.documents[documentId].cois[
                        coiKey
                      ] = _.merge({}, orgCoi, response.data)
                    })
                    .catch(err => {
                      console.log(
                        'Error. Failed to load coi ',
                        coiKey,
                        'from doc',
                        documentId
                      )
                    })
                }
              )
            }
          })
      })
      .catch(err => {
        console.log('Error. Failed to load document', documentId, err)
      })
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
