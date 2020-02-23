import _ from 'lodash';
import Promise from 'bluebird';
import request from 'axios';
import config from '../../config';
import { browser as oadaIdClient }from '@oada/oada-id-client/index.js';

const getAccessToken = Promise.promisify(oadaIdClient.getAccessToken);

const lsKey = url => 'oada:'+url+':token'; // handy function to make a useful localStorage key

export default {
  async logout({ state, effects }) {
    await effects.oada.websocket.close();
    //Clear documents
    state.oada.data.documents = {};
    delete window.localStorage[lsKey(state.oada.url)];
  },
  login({ state, actions }) {
    /*
      Connect to my OADA instance
    */
    return Promise.try(() => {
      if (window.localStorage[lsKey(state.oada.url)]) {
        console.log('Already have a token for URL '+state.oada.url+', logout to clear');
        return window.localStorage[lsKey(state.oada.url)];
      }
      // If we don't have a token stored from last time, we'll need to 
      // redirect browser to ask for one
      console.log('Do not have an access token, redirecting...');
      return getAccessToken(state.oada.url.replace(/^https?:\/\//,''), {
        metadata: config.oada.devcert,
        scope: 'all:all',
        redirect: config.oada.redirect,
      }).then(res => res.access_token)
      .catch(err => {
        state.login.error = 'Failed to redirect to '+state.oada.url+' for connection';
        console.log('FAILED TO GET ACCESS TOKEN: err = ', err);
        return false;
      });

    // Have a token now, make sure it's saved to localStorage until we logout:
    }).then(token => {
      if (token) window.localStorage[lsKey(state.oada.url)] = token;
      state.oada.token = token;
      console.log('Have token, connecting to oada...');
      return actions.oada.connect();

    }).then((result) => {
      console.log('Websocket connected, checking resources...');
      //Create /trellisfw if it does not exist
      return actions.oada.doesResourceExist('/bookmarks/trellisfw').then((exists) => {
        if (!exists) {
          console.log('/bookmarks/trellisfw does not exist.  Creating...');
          //Create /trellisfw
          return actions.oada.createAndPutResource({
            url: '/bookmarks/trellisfw',
            data: {}
          });
        }
      }).then(() => {
        //Create /trellisfw/documents if it does not exist
        return actions.oada.doesResourceExist('/bookmarks/trellisfw/documents').then((exists) => {
          if (!exists) {
            //Create documents
            return actions.oada.createAndPutResource({
              url: '/bookmarks/trellisfw/documents',
              data: {},
              contentType: 'application/vnd.trellisfw.documents.1+json'}
            );
          }
        });
      })
    }).then(() => {
      console.log('Setting watches...');
      //Watch for changes to /trellisfw/documents
      return actions.oada.watch({url: '/bookmarks/trellisfw/documents', actionName: 'oada.onDocumentsChange'}).then(() => {
        //Get all the documents ids in /trellisfw/documents
        return actions.oada.get('/bookmarks/trellisfw/documents').then((response) => {
          let docKeys = _.filter(Object.keys(response.data), key=>(_.startsWith(key, '_')===false));
          //Load each of the documents
          return Promise.map(docKeys, (key) => {
            //Load the documents
            return actions.oada.loadDocument(key);
          }, {concurrency: 5});
        })
      })
    });
  },

  uploadFile({ state, actions }, file) {
    //Add file to the file list, flag it as `uploading`
    //Create the pdf
    return request.request({
      url: '/resources',
      method: 'post',
      baseURL: state.oada.url,
      headers: {
        Authorization: 'Bearer '+state.oada.token,
        'Content-Disposition': 'inline',
        'Content-Type': file.type
      },
      data: file
    }).then((response) => {
      //Pull out location of pdf and link it to the document under the 'pdf' key
      var id = response.headers['content-location'].split('/')
      id = id[id.length-1];
      //Add filename info to the pdf
      return actions.oada.put({
        url: `/resources/${id}/_meta`,
        data: {
          filename: file.name
        },
        headers: {
          'Content-Type': 'application/json',
        }
      }).then(() => {
        //Create a document with a `pdf` key linking the pdf, and link the document to `documents`
        return actions.oada.createAndPostResource({
          url: '/bookmarks/trellisfw/documents',
          data: {
            pdf: {
              _id:'resources/'+id,
              _rev: 0
            }
          }
        })
      })
    });
  },
  onDocumentsChange({ state, actions }, response) {
    //If a key was added or changed reload that document
    console.log('onDocumentsChange', response);
    //Check if change was a merge
    if (_.get(response, 'change.type') == 'merge') {
      //Get all the keys that do not start with _
      let keys = _.filter(Object.keys(_.get(response, 'change.body')), key=>(_.startsWith(key, '_')===false));
      //If these keys are links, then load them as documents
      return Promise.map(keys, (documentId) => {
        return actions.oada.loadDocument(documentId);
      })
    } else if (_.get(response, 'change.type') == 'delete') {
      //Get all the keys that do not start with _
      let keys = _.filter(Object.keys(_.get(response, 'change.body')), key=>(_.startsWith(key, '_')===false));
      //If these keys are links, then load them as documents
      _.forEach(keys, (key) => {
        delete state.oada.data.documents[key]
      })
    }
  },
  loadDocument({ state, actions }, documentId) {
    return actions.oada.get('/bookmarks/trellisfw/documents/'+documentId).then((response) => {
      //If doc already exists merge in data
      const orgData = state.oada.data.documents[documentId] || {};
      state.oada.data.documents[documentId] = _.merge({}, orgData, response.data);
      //Load the _meta for this document
      return actions.oada.get(`/bookmarks/trellisfw/documents/${documentId}/_meta`).then((response) => {
        if (response == null) throw Error('No data');
        const orgMeta = state.oada.data.documents[documentId]._meta;
        //Merge in status and services
        state.oada.data.documents[documentId]._meta = _.merge({}, orgMeta, _.pick(response.data, ['stats', 'services']));
      }).catch((err) => {
        console.log('Error. Failed to load document _meta', documentId);
      }).then(() => {
        //Load the meta for the pdf of this doc
        if (state.oada.data.documents[documentId].pdf != null) {
          return actions.oada.get(`/bookmarks/trellisfw/documents/${documentId}/pdf/_meta`).then((response) => {
            if (response == null) throw Error('No data');
            const orgMeta = state.oada.data.documents[documentId].pdf._meta || {};
            state.oada.data.documents[documentId].pdf._meta = _.merge({}, orgMeta, _.pick(response.data, ['filename']));
          }).catch((err) => {
            console.log('Error. Failed to load pdf _meta', documentId);
          })
        }
      }).then(() => {
        //Load the audit info for this document if it exists
        if (state.oada.data.documents[documentId].audits != null) {
          return Promise.map(_.keys(state.oada.data.documents[documentId].audits), (auditKey) => {
            return actions.oada.get(`/bookmarks/trellisfw/documents/${documentId}/audits/${auditKey}`).then((response) => {
              if (response == null) throw Error('No data');
              const orgAudit = state.oada.data.documents[documentId].audits[auditKey] || {};
              state.oada.data.documents[documentId].audits[auditKey] = _.merge({}, orgAudit, response.data);
            }).catch((err) => {
              console.log('Error. Failed to load audit ', auditKey, 'from doc', documentId);
            })
          });
        }
      }).then(() => {
        //Load the cois info for this document if it exists
        if (state.oada.data.documents[documentId].cois != null) {
          return Promise.map(_.keys(state.oada.data.documents[documentId].cois), (coiKey) => {
            return actions.oada.get(`/bookmarks/trellisfw/documents/${documentId}/cois/${coiKey}`).then((response) => {
              if (response == null) throw Error('No data');
              const orgCoi = state.oada.data.documents[documentId].cois[coiKey] || {};
              state.oada.data.documents[documentId].cois[coiKey] = _.merge({}, orgCoi, response.data);
            }).catch((err) => {
              console.log('Error. Failed to load coi ', coiKey, 'from doc', documentId);
            })
          });
        }
      })
    }).catch((err) => {
      console.log('Error. Failed to load document', documentId, err);
    });
  },
  createAndPostResource({ actions }, {url, data, contentType}) {
    return actions.oada.createResource({data, contentType}).then((response) => {
      //Link this new resource at the url provided
      var id = response.headers['content-location'].split('/')
      id = id[id.length-1]
      return actions.oada.post({
        url: url,
        headers: {
          'Content-Type': contentType || 'application/json'
        },
        data: {
          _id:'resources/'+id,
          _rev: 0
        }
      }).then((response) => {
        var id = response.headers['content-location'].split('/')
        id = id[id.length-1]
        return id;
      })
    })
  },
  createAndPostResourceHTTP({ actions }, {url, data, contentType}) {
    return actions.oada.createResourceHTTP({data, contentType}).then((response) => {
      //Link this new resource at the url provided
      var id = response.headers['content-location'].split('/')
      id = id[id.length-1]
      return actions.oada.postHTTP({
        url: url,
        headers: {
          'Content-Type': contentType || 'application/json'
        },
        data: {
          _id:'resources/'+id,
          _rev: 0
        }
      }).then((response) => {
        var id = response.headers['content-location'].split('/')
        id = id[id.length-1]
        return id;
      })
    })
  },
  createAndPutResource({ actions }, {url, data, contentType}) {
    return actions.oada.createResource({data, contentType}).then((response) => {
      //Link this new resource at the url provided
      var id = response.headers['content-location'].split('/')
      id = id[id.length-1]
      return actions.oada.put({
        url,
        headers: {
          'Content-Type': contentType || 'application/json'
        },
        data: {
          _id:'resources/'+id,
          _rev: 0
        }
      });
    })
  },
  createResource({ actions }, {data, contentType}) {
    var headers = {};
    headers['content-type'] = contentType || 'application/json';
    return actions.oada.post({url: '/resources', data, headers})
  },
  createResourceHTTP({ actions }, {data, contentType}) {
    var headers = {};
    headers['content-type'] = contentType || 'application/json';
    return actions.oada.postHTTP({url: '/resources', data, headers})
  },
  doesResourceExist({ actions }, url) {
    return actions.oada.head(url).then((response) => {
      if (response != null) return true;
      return false;
    }).catch((error) => {
      if (error.response && error.response.status === 404) return false;
      throw error;
    })
  },
  connect({ state, effects }) {
    return effects.oada.websocket.connect(state.oada.url)
  },
  get({ effects, state }, url) {
    return effects.oada.websocket.http({
      method: 'GET',
      url: url,
      headers: {
        Authorization: 'Bearer '+state.oada.token
      }
    })
  },
  head({ effects, state }, url) {
    return effects.oada.websocket.http({
      method: 'HEAD',
      url: url,
      headers: {
        Authorization: 'Bearer '+state.oada.token
      }
    });
  },
  post({ effects, state }, {url, headers, data}) {
    console.log('Posting to url ', url);
    return effects.oada.websocket.http({
      method: 'POST',
      url: url,
      headers: _.merge({
        Authorization: 'Bearer '+state.oada.token
      }, headers),
      data: data
    })
  },
  postHTTP({ effects, state }, {url, headers, data}) {
    return request.request({
      url: url,
      method: 'post',
      baseURL: state.oada.url,
      headers: _.merge({
        Authorization: 'Bearer '+state.oada.token
      }, headers),
      data: data
    })
  },
  put({ effects, state }, {url, headers, data}) {
    return effects.oada.websocket.http({
      method: 'PUT',
      url: url,
      headers: _.merge({
        Authorization: 'Bearer '+state.oada.token
      }, headers),
      data: data
    })
  },
  watch({ effects, actions, state }, {url, actionName}) {
    var cb = function callback(data) {
      var action = _.get(actions, actionName);
      action(data);
    }
    return effects.oada.websocket.watch({
      url,
      headers: {Authorization: 'Bearer '+state.oada.token}
    },
    cb);
  }
}
