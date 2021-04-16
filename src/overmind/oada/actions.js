import urlLib from 'url'
import _ from 'lodash'
import Promise from 'bluebird'
import request from 'axios'
import moment from 'moment';
import XLSX from 'xlsx';
import config from '../../config'
import {browser as oadaIdClient} from '@oada/oada-id-client/index.js'

const getAccessToken = Promise.promisify(oadaIdClient.getAccessToken)

let DOC_TYPES = ['cois', 'fsqa-certificates', 'fsqa-audits', 'letters-of-guarantee', 'documents'];
let LIST_TYPES = ['coi-holders', 'facilities', 'letter-of-guarantee-buyers', 'trading-partners'];
let EXPAND = {};

export default {
  getList({}, type) {
    return EXPAND[type]
  },
  async logout({state, effects}) {
    await effects.oada.websocket.close()
    //Clear documents
    state.oada.data = {}
    //Clear the token from state
    state.oada.token = null;
    //Clear the token from local storage
    delete window.localStorage['oada:' + state.oada.url + ':token']
  },
  async connect({state, actions, effects}, {domain, token}) {
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
        })
        token = res.access_token
      }
    } catch (err) {
      state.login.error = 'Failed to redirect to ' + state.oada.url + ' for connection'
      console.log('FAILED TO GET ACCESS TOKEN: err = ', err)
      token = null;
    }
    // Save the token to localStorage
    if (token && !state.login.dontSaveToken) window.localStorage['oada:' + state.oada.url + ':token'] = token
    state.oada.token = token
    console.log('Token: ' + token);
    console.log('Have token, connecting to oada with WebSocket...')
    await actions.oada.connect({
      token: '2pgKX9He05laIRfHsSy-TtH7cFN1wLuyW9st9yKT',
      domain: state.oada.url,
      options: {
        metadata: config.oada.devcert,
        scope: 'all:all',
        redirect: config.oada.redirect,
        cache: false
      }
    })
    console.log('Websocket connected')
  },
  async initialize({state, actions}) {
    state.oada.data = {};
    actions.oadaHelper.initializeConfig();
    actions.oadaHelper.initializeDocuments();
    actions.oadaHelper.initializeLookups();
    actions.oadaHelper.initializeReports();
    actions.rules.initialize();
  },
  async initializeConfig({state, actions}) {
    //Load config
    let response = await actions.oada.get({path:`/bookmarks/conductor`})
    if (response.error) {
      if (response.error.response && response.error.response.status === 404) {
        console.log('No config exists for this user. Using defaults.');
      }
    } else {
      state.app.config = response.data;
    }
  },
  async initializeLookups({state, actions}) {
  // Get expanded list of trading partners
    await Promise.each(LIST_TYPES, async (type) => {
      let response = await actions.oada.get({path:`/bookmarks/trellisfw/${type}/expand-index`})
      if (response.error) {
        if (response.error.response && response.error.response.status === 404) {
          console.log(`no ${type} present for current user`);
        }
      } else {
        EXPAND[type] = response.data;
      }
    })
    state.tps = EXPAND['trading-partners'];
  },

  async initializeDocuments({state, actions}) {
    //Create /trellisfw if it does not exist
    let path = state.oada.path || '/bookmarks/trellisfw';
    let exists = await actions.oadaHelper
      .doesResourceExist(path)
    if (!exists) {
      console.log(`${path} does not exist.  Creating...`)
      //Create /trellisfw
      await actions.oadaHelper.createAndPutResource({
        url: path,
        data: {}
      })
    }

    //Create document endpoints if they do not exist
    DOC_TYPES.forEach(async (docType) => {

      state.oada.data[docType] = {}

      exists = await actions.oadaHelper
        .doesResourceExist(`${path}/${docType}`)
      if (!exists) {
        //Create documents
        await actions.oadaHelper.createAndPutResource({
          url: `${path}/${docType}`,
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
          .get({
            path: `${path}/${docType}`,
            watch: { actions:[ actions.oadaHelper.onDocumentsChange]}
          })
      } else if (docType == 'cois') {
        await actions.oada
          .get({
            path: `${path}/${docType}`,
            watch: { actions:[ actions.oadaHelper.onCOISChange]}
          })
      } else if (docType == 'fsqa-audits') {
        await actions.oada
          .get({
            path: `${path}/${docType}`,
            watch: { actions:[ actions.oadaHelper.onAuditsChange]}
          })
      }

      //Get all the documents ids in /trellisfw/${docType}
      let response = await actions.oada
        .get({path:`${path}/${docType}`})
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

  async initializeReports({state, actions}) {
    const hasReports = await actions.oadaHelper
      .doesResourceExist('/bookmarks/services/trellis-reports');

    if (!hasReports) {
      await actions.oada.createAndPutResource({
        url: `/bookmarks/services/trellis-reports`,
        data: {},
      });
      await actions.oada.createAndPutResource({
        url: `/bookmarks/services/trellis-reports/event-log`,
        data: {'day-index': {}},
      });
      await actions.oada.createAndPutResource({
        url: `/bookmarks/services/trellis-reports/current-tradingpartnershares`,
        data: {'day-index': {}},
      });
      await actions.oada.createAndPutResource({
        url: `/bookmarks/services/trellis-reports/current-shareabledocs`,
        data: {'day-index': {}},
      });
    }
    
    //TODO: move all of this to trellis...
    state.oada.data['Reports'] = {
      eventLog: {},
      userAccess: {},
      documentShares: {},
    };

    actions.oadaHelper.initializeEventLog();
    actions.oadaHelper.initializeUserAccess();
    actions.oadaHelper.initializeDocumentShares();
  },

  async initializeEventLog({actions, state}) {
    let days;
    try {
      console.log('Getting Event Log');
      days = await actions
        .oada
        .get({path: '/bookmarks/services/trellis-reports/event-log/day-index'})
        .then((res) => {
          return Object.keys(res.data);
        });
      // console.log(days);
    } catch (e) {
      console.error('failed to get report day index list');
    }

    (days || []).forEach((day) => {
      state.oada.data.Reports.eventLog[day] = {
        checked: false,
        data: undefined,
      };
    });
  },

  async initializeUserAccess({actions, state}) {
    let days;
    try {
      console.log('Getting User Access');
      days = await actions
        .oada
        .get({path:'/bookmarks/services/trellis-reports/current-tradingpartnershares/day-index'})
        .then((res) => {
          return Object.keys(res.data);
        });
      // console.log(days);
    } catch (e) {
      console.error('failed to get report day index list');
    }
    (days || []).forEach((day) => {
      state.oada.data.Reports.userAccess[day] = {
        checked: false,
        data: undefined,
      }
    });
  },

  async initializeDocumentShares({actions, state}) {
    let days;
    try {
      console.log('Getting Event Log');
      days = await actions
        .oada
        .get({path: '/bookmarks/services/trellis-reports/current-shareabledocs/day-index'})
        .then((res) => {
          return Object.keys(res.data);
        });
    } catch (e) {
      console.error('failed to get report day index list');
    }

    (days || []).forEach((day) => {
      state.oada.data.Reports.documentShares[day] = {
        checked: false,
        data: undefined,
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
    switch (docType) {
      case 'cois':
        if (_.get(doc, '_meta.lookups.coi') == null) return [];
        //One CoI holder to many TPs
        ref = doc._meta.lookups.coi.holder._ref;
        holder = await actions.oada.get({path:ref})
        console.log(holder);
        tps = holder.data['trading-partners'] || {};
        tps = Object.keys(tps).map(masterid => {
          const partner = _.find(EXPAND['trading-partners'], {masterid});
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
        organization = await actions.oada.get({path:ref})
        masterid = organization.data.masterid;
        tps = _.filter(EXPAND['trading-partners'], (tp) => {
          if (tp.facilities == null) return false;
          return tp.facilities[masterid] ? true : false
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
        organization = await actions.oada.get({path:ref})
        masterid = organization.data.masterid;
        tps = _.filter(EXPAND['trading-partners'], (tp) => {
          if (tp.facilities == null) return false;
          return tp.facilities[masterid] ? true : false
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
  uploadFile({state, actions}, file) {
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
            path: `/resources/${id}/_meta`,
            data: {
              filename: file.name
            },
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(() => {
            //Create a link to the new pdf in /documents
            let pathPrefix = state.oada.path;
            return actions.oada
              .put({
                path: `${pathPrefix}/documents/${id}`,
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
  onDocumentsChange({state, actions}, response) {
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
  onCOISChange({state, actions}, response) {
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
  onAuditsChange({state, actions}, response) {
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
  loadMeta({state, actions}, {documentId, docType}) {
    let pathPrefix = state.oada.path || '/bookmarks/trellisfw';
    let path = `${pathPrefix}/${docType}/${documentId}`;
    return actions.oada
      .get(path + `/_meta`)
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
  loadDocument({state, actions}, {documentId, docType}) {
    let pathPrefix = state.oada.path || '/bookmarks/trellisfw';
    let path = `${pathPrefix}/${docType}/${documentId}`;
    return actions.oada
      .get({path})
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
          .get({path:path + `/_meta`})
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

  async loadEventLog({state, actions}, documentKey) {
    const statistics = await actions.oada.getReportStatistics({
      path: 'event-log',
      date: documentKey,
    });
    if (statistics) {
      state.oada.data.Reports.eventLog[documentKey].data = statistics;
      return;
    }

    const eventLogRows = actions.oada.getReportRows({
      path: 'event-log',
      date: documentKey
    });
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
      numEvents: eventLogRows.length,
      numDocuments: 0,
      numEmails: 0,
      numShares: 0,
    });
    state.oada.data.Reports.eventLog[documentKey].data = {
      rows: eventLogRows,
      ...eventLogStatistics,
    };
  },

  async loadUserAccess({state, actions}, documentKey) {
    const statistics = await actions.oada.getReportStatistics({
      path: 'current-tradingpartnershares',
      date: documentKey,
    });
    if (statistics) {
      state.oada.data.Reports.userAccess[documentKey].data = statistics;
      return;
    }

    const userAccessRows = await actions.oada.getReportRows({
      path: 'current-tradingpartnershares',
      date: documentKey,
    });
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

    state.oada.data.Reports.userAccess[documentKey].data = {
      rows: userAccessRows,
      ...userAccessStatistics,
    };
  },

  async loadDocumentShares({state, actions}, documentKey) {
    const statistics = await actions.oada.getReportStatistics({
      path: 'current-shareabledocs',
      date: documentKey,
    });
    if (statistics) {
      state.oada.data.Reports.documentShares[documentKey].data = statistics;
      return;
    }

    const documentSharesRows = await actions.oada.getReportRows({
      path: 'current-shareabledocs',
      date: documentKey,
    });
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
    state.oada.data.Reports.documentShares[documentKey].data = {
      rows: documentSharesRows,
      ...documentSharesStatistics
    };
  },

  async getReportRows({actions, state}, {path, date}) {
    const reportRaw = await request.request({
      method: 'GET',
      responseType: 'blob',
      url: `/bookmarks/services/trellis-reports/${path}/day-index/${date}`,
      baseURL: state.oada.url,
      headers: {
        Authorization: `Bearer ${state.oada.token}`,
      },
    }).then((res) => {
      return res.data;
    });

    const wb = XLSX.read(await reportRaw.arrayBuffer(), {
      type: 'array',
    });
    return XLSX.utils.sheet_to_json(
      wb.Sheets[wb.SheetNames[0]]
    );
  },

  async getReportStatistics({actions}, {path, date}) {
    try {
      return actions.oada.get(
        `/bookmarks/services/trellis-reports/${path}/day-index/${date}/_meta`
      ).then((res) => _.get(res, 'data.statistics'));
    } catch (e) {
      console.error('failed to fetch statistics, building from from report');
    }
  },

  createAndPostResource({actions}, {url, data, contentType}) {
    return actions.oada.createResource({data, contentType}).then(response => {
      //Link this new resource at the url provided
      var id = response.headers['content-location'].split('/')
      id = id[id.length - 1]
      return actions.oada
        .post({
          path: url,
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
  createAndPostResourceHTTP({actions}, {url, data, contentType}) {
    return actions.oada
      .createResourceHTTP({data, contentType})
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
  createAndPutResource({actions}, {url, data, contentType}) {
    return actions.oadaHelper.createResource({data, contentType}).then(response => {
      //Link this new resource at the url provided
      var id = response.headers['content-location'].split('/')
      id = id[id.length - 1]
      return actions.oada.put({
        path: url,
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
  createResource({actions}, {data, contentType}) {
    var headers = {}
    headers['content-type'] = contentType || 'application/json'
    return actions.oada.post({path: '/resources', data, headers})
  },
  createResourceHTTP({actions}, {data, contentType}) {
    var headers = {}
    headers['content-type'] = contentType || 'application/json'
    return actions.oadaHelper.postHTTP({url: '/resources', data, headers})
  },
  doesResourceExist({actions}, url) {
    return actions.oada
      .head({path:url})
      .then(response => {
        if (response.error) {
          if (response.error.response && response.error.response.status === 404) return false
        }
        if (response != null) return true
        return false
      });
  },
  get({effects, state}, url) {
    return effects.oadaHelper.websocket.http({
      method: 'GET',
      url: url,
      headers: {
        Authorization: 'Bearer ' + state.oada.token
      }
    }).catch((err) => {
      return {error: err}
    });
  },
  head({effects, state}, url) {
    return effects.oadaHelper.websocket.http({
      method: 'HEAD',
      url: url,
      headers: {
        Authorization: 'Bearer ' + state.oada.token
      }
    }).catch((err) => {
      return {error: err}
    });
  },
  post({effects, state}, {url, headers, data}) {
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
  postHTTP({effects, state}, {url, headers, data}) {
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
  del({effects, state}, {url, headers, data}) {
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
  put({effects, state}, {url, headers, data}) {
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
  watch({effects, actions, state}, {url, actionName}) {
    var cb = function callback(data) {
      var action = _.get(actions, actionName)
      action(data)
    }
    return effects.oada.websocket.watch(
      {
        url,
        headers: {Authorization: 'Bearer ' + state.oada.token}
      },
      cb
    ).catch((err) => {
      return {error: err}
    });
  }
}
