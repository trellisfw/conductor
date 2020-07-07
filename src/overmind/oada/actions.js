import urlLib from 'url'
import _ from 'lodash'
import Promise from 'bluebird'
import request from 'axios'
import moment from 'moment';
import XLSX from 'xlsx';
import config from '../../config'
import { browser as oadaIdClient } from '@oada/oada-id-client/index.js'

const getAccessToken = Promise.promisify(oadaIdClient.getAccessToken)

let DOC_TYPES = ['cois', 'fsqa-certificates', 'fsqa-audits', 'letters-of-guarantee', 'documents'];
let COI_HOLDERS = {};
let TRADING_PARTNERS = {};
let FACILITIES = {};

export default {
  async holders({state, effects}) {
    return COI_HOLDERS
  },
  async tradingPartners({state, effects}) {
    return TRADING_PARTNERS
  },
  async facilities({state, effects}) {
    return FACILITIES;
  },
  async logout ({ state, effects }) {
    await effects.oada.websocket.close()
    //Clear documents
    state.oada.data = {}
    //Clear the token from state
    state.oada.token = null;
    //Clear the token from local storage
    delete window.localStorage['oada:'+state.oada.url+':token']
  },
  async connect({ state, actions, effects }, {domain, token}) {
    /*
      Connect to my OADA instance, getting token if we don't have one
    */
    state.oada.url = domain;
    try {
      if (!token) {
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
      state.login.error = 'Failed to redirect to ' + state.oada.url + ' for connection'
      console.log('FAILED TO GET ACCESS TOKEN: err = ', err)
      token = null;
    }
    // Save the token to localStorage
    if (token && !state.login.dontSaveToken) window.localStorage['oada:'+state.oada.url+':token'] = token
    state.oada.token = token
    console.log('Token: ' + token);
    console.log('Have token, connecting to oada with WebSocket...')
    await effects.oada.websocket.connect(state.oada.url)
    console.log('Websocket connected')
  },
  async initialize({actions}) {
    actions.oada.initializeLookups();
    actions.oada.initializeDocuments();
    actions.oada.initializeReports();
    actions.rules.initialize();
  },
  async initializeLookups({state, actions}) {
  // Get expanded list of trading partners
    try {
      let response = await actions.oada
        .get(`/bookmarks/trellisfw/trading-partners/expand-index`)
      TRADING_PARTNERS = response.data;
      console.log('TRADING PARTNERS', TRADING_PARTNERS);
    } catch(err) {
      if (err.response && err.response.status === 404) {
        console.log('no trading partners present for current user');
      }
    }

  // Get expanded list of coi-holders
    try {
      let response = await actions.oada
        .get(`/bookmarks/trellisfw/coi-holders/expand-index`)
      COI_HOLDERS = response.data;
      console.log("COI_HOLDERS", COI_HOLDERS);
    } catch(err) {
      if (err.response && err.response.status === 404) {
        console.log('no coi-holders present for current user');
      }
    }

    try {
      let response = await actions.oada
        .get(`/bookmarks/trellisfw/facilities/expand-index`)
      FACILITIES = response.data;
    } catch(err) {
      if (err.response && err.response.status === 404) {
        console.log('no coi-holders present for current user');
      }
    }

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
      } else if (docType == 'fsqa-audits') {
        await actions.oada
          .watch({
            url: `/bookmarks/trellisfw/${docType}`,
            actionName: 'oada.onAuditsChange'
          })
      }

      //Get all the documents ids in /trellisfw/${docType}
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

  async initializeReports({ state, actions }) {
    const hasReports = await actions.oada
      .doesResourceExist('/bookmarks/services/trellis-reports');

    if (!hasReports) {
      await actions.oada.createAndPutResource({
        url: `/bookmarks/services/trellis-reports`,
        data: {},
      });
      await actions.oada.createAndPutResource({
        url: `/bookmarks/services/trellis-reports/reports`,
        data: { 'day-index': {} },
      });
    }

    state.oada.data['Reports'] = {};

    let days;
    try {
      console.log('Getting Reports');
      days = await actions
        .oada
        .get('/bookmarks/services/trellis-reports/reports/day-index')
        .then((res) => {
          return Object.keys(res.data);
        });
      // console.log(days);
    } catch (e) {
      console.error('failed to get report day index list');
    }

    days.map((day) => {
      // state.oada.data['Reports'][day] = null;
      state.oada.data['Reports'][day] = {
        checked: false,
        'eventLog': null,
        'userAccess': null,
        'documentShares': null,
      }
    });
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
            masterid,
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
            masterid: tp.id,
            with: tp.name,
            type: 'shareWf'
          }
        });
        tps = _.compact(tps);
        return tps;
      case 'fsqa-certificates':
        if (_.get(doc, '_meta.lookups.fsqa-certificate.organization') == null) return [];
        ref = doc._meta.lookups['fsqa-certificate']['organization']._ref;
        organization = await actions.oada.get(ref)
        masterid = organization.data.masterid;
        tps = _.filter(TRADING_PARTNERS, (tp) => {
          if (tp.facilities == null) return false;
          return tp.facilities[masterid] ? true: false
        }).map((tp) => {
          if (tp) return {
            masterid: tp.id,
            with: tp.name,
            type: 'shareWf'
          }
        });
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

  async loadEventLog({ state, actions }, documentKey) {
    const eventLogData = await request.request({
      method: 'GET',
      responseType: 'blob',
      url: `/bookmarks/services/trellis-reports/reports/day-index/${documentKey}/event-log`,
      baseURL: state.oada.url,
      headers: {
        Authorization: `Bearer ${state.oada.token}`,
      },
    }).then((res) => {
      return res.data;
    });

    const eventLogWB = XLSX.read(await eventLogData.arrayBuffer(), {
      type: 'array',
    });
    const eventLogRows = XLSX.utils.sheet_to_json(eventLogWB.Sheets[eventLogWB.SheetNames[0]]);
    let eventLogDocuments = {};
    const eventLogStatistics = eventLogRows.reduce((acc, row) => {
      if (eventLogDocuments[row['document id']] === undefined) {
        eventLogDocuments[row['document id']] = {};
        acc.numDocuments++;
      }
      if (row['event type'] === 'share') {
        acc.numShares++;
      } else if (row['event type'] === 'email') {
        acc.numEmails++;
      }
      return acc;
    }, {
      numDocuments: 0,
      numEmails: 0,
      numShares: 0,
    });
    state.oada.data.Reports[documentKey]['eventLog'] = {
      rows: eventLogRows,
      numEvents: eventLogRows.length,
      ...eventLogStatistics,
    };
  },

  async loadUserAccess({ state, actions }, documentKey) {
    const userAccessData = await request.request({
      method: 'GET',
      responseType: 'blob',
      url: `/bookmarks/services/trellis-reports/reports/day-index/${documentKey}/current-tradingpartnershares`,
      baseURL: state.oada.url,
      headers: {
        Authorization: `Bearer ${state.oada.token}`,
      },
    }).then((res) => {
      return res.data;
    });

    const userAccessWB = XLSX.read(await userAccessData.arrayBuffer(), {
      type: 'array',
    });
    const userAccessRows = XLSX.utils.sheet_to_json(userAccessWB.Sheets[userAccessWB.SheetNames[0]]);
    const tradingPartners = {};
    const userAccessStatistics = userAccessRows.reduce((acc, row) => {
      if (tradingPartners[row['trading partner masterid']] === undefined) {
        acc.numTradingPartners++;
        tradingPartners[row['trading partner masterid']] = {};
        if (row['document type'] === undefined) {
          acc.numTPWODocs++;
          acc.totalShares--;
        }
      }
      return acc;
    }, {
      numTradingPartners: 0,
      numTPWODocs: 0,
      totalShares: userAccessRows.length,
    });

    state.oada.data.Reports[documentKey]['userAccess'] = {
      rows: userAccessRows,
      ...userAccessStatistics,
    };
  },

  async loadDocumentShares({ state, actions }, documentKey) {
    const documentSharesData = await request.request({
      method: 'GET',
      responseType: 'blob',
      url: `/bookmarks/services/trellis-reports/reports/day-index/${documentKey}/current-shareabledocs`,
      baseURL: state.oada.url,
      headers: {
        Authorization: `Bearer ${state.oada.token}`,
      },
    }).then((res) => {
      return res.data;
    });

    const documentSharesWB = XLSX.read(await documentSharesData.arrayBuffer(), {
      type: 'array',
    });
    const documentSharesRows = XLSX.utils.sheet_to_json(
      documentSharesWB.Sheets[documentSharesWB.SheetNames[0]]
    );
    let documents = {};
    const today = moment();
    const documentSharesStatistics = await Promise.reduce(documentSharesRows, async (acc, row) => {
      if (documents[row['document id']] === undefined) {
        acc.numDocsToShare++;
        documents[row['document id']] = {};
        // TODO lookup document expiration date
        if (row['trading partner masterid'] === '') {
          acc.numDocsNotShared++;
        }
        const docKey = row['document id'].split("/")[1];
        let vdoc;
        if (state.oada.data['fsqa-audits'][docKey] !== undefined) {
          vdoc = state.oada.data['fsqa-audits'][docKey];
        } else if (state.oada.data['cois'][docKey] !== undefined) {
          vdoc = state.oada.data['cois'][docKey];
        } else {
          vdoc = await actions.oada.get(row['document id']).then((res) => {
            return res.data;
          });
        }
        if (vdoc === null || vdoc === undefined) {
          return acc;
        }
        let exprDate;
        switch (row['document type']) {
          case 'coi':
            exprDate = moment
              .min(
                Object.values(vdoc.policies).map((policy) => {
                  return moment(policy.expire_date);
                }),
              )
            break;
          case 'audit':
            exprDate = moment(
              vdoc.certificate_validity_period.end,
              'MM/DD/YYYY'
            );
            break;
        }
        if (exprDate.isAfter(today)) {
          acc.numExpiredDocuments++;
        }
      }
      return acc;
    }, {
      numDocsToShare: 0,
      numExpiredDocuments: 0,
      numDocsNotShared: 0,
    });
    state.oada.data.Reports[documentKey]['documentShares'] = {
      rows: documentSharesRows,
      ...documentSharesStatistics,
    };
  },

  createAndPostResource({actions}, {url, data, contentType}) {
    return actions.oada.createResource({data, contentType}).then(response => {
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
      console.log('response', response)
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
  get ({ effects, state }, url) {
    return effects.oada.websocket.http({
      method: 'GET',
      url: url,
      headers: {
        Authorization: 'Bearer ' + state.oada.token
      }
    }).catch((err) => {
      return {error: err}
    });
  },
  head ({ effects, state }, url) {
    return effects.oada.websocket.http({
      method: 'HEAD',
      url: url,
      headers: {
        Authorization: 'Bearer ' + state.oada.token
      }
    }).catch((err) => {
      return {error: err}
    });
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
    }).catch((err) => {
      return {error: err}
    });
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
    }).catch((err) => {
      return {error: err}
    });
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
    }).catch((err) => {
      return {error: err}
    });
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
    }).catch((err) => {
      return {error: err}
    });
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
    ).catch((err) => {
      return {error: err}
    });
  }
}
