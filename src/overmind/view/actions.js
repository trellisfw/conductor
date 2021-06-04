import _ from 'lodash';
import Fuse from 'fuse.js';
import md5 from 'md5';
import uuid from 'uuid/v4';
import Promise from 'bluebird';
import {json} from 'overmind';
import fileDownload from 'js-file-download';
import request from 'axios'
import moment from 'moment';
import XLSX from 'xlsx';
import config from '../../config/config.js'

let {sf_bus_id, fl_host, fl_token} = config['foodlogiq'];
let DOC_TYPES = ['cois', 'fsqa-certificates', 'fsqa-audits', 'letters-of-guarantee', 'documents'];
let fuseSearch;
export default {
  TopBar: {
    logout({state, actions}) {
      actions.login.logout()
      actions.oadaHelper.logout();
    },
    tpSelect({state, actions}) {
      state.view.Modals.TPSelectModal.open = true;
    },
    toSmithfield({state, actions}) {
      delete state.view.tp;
      delete state.view.Modals.TPSelectModal.key;
      state.oadaHelper.path = `/bookmarks/trellisfw`
      actions.oadaHelper.initializeDocuments();
    }
  },
  Modals: {
    EditRuleModal: {
      close({state, actions}) {
        state.view.Modals.EditRuleModal.open = false;
      }
    },
    TPSelectModal: {
      done({state, actions}) {
        if (state.view.Modals.TPSelectModal.tp) {
          state.view.tp = state.view.Modals.TPSelectModal.tp;
          let key = state.view.Modals.TPSelectModal.key;
//          let location = state.view.Modals.TPSelectModal.pending ? 'shared' : 'bookmarks';
//          state.view.pending = state.view.Modals.TPSelectModal.pending;
          state.oadaHelper.path = `/bookmarks/trellisfw/trading-partners/${key}`
          actions.oadaHelper.initializeDocuments();
        }
        state.view.Modals.TPSelectModal.open = false;
      },
      close({state}) {
        state.view.Modals.TPSelectModal.open = false;
      },
      changeTP({state, actions}, props) {
        state.view.Modals.TPSelectModal.tp = state.tps[props].name;
        state.view.Modals.TPSelectModal.key = props;
      },
      onSearchChange({state, actions}, props) {
        state.view.Modals.TPSelectModal.options = props.data;
      },
      checkPending({state, actions}, props) {
        state.view.Modals.TPSelectModal.pending = !state.view.Modals.TPSelectModal.pending;
      }
    },
    RulesModal: {
      backClicked({state, actions}) {
        state.view.Modals.RulesModal.page = 'List';
      },
      close({state, actions}) {
        state.view.Modals.RulesModal.open = false;
      },
      categorySelected({state, actions}, evt) {
        state.view.Modals.RulesModal.category = evt.target;
      },
      newRuleSelected({state, actions}, rule) {
        state.view.Modals.RulesModal.Edit = {
          template: json(rule),
          rule: json(rule)
        };
        state.view.Modals.RulesModal.page = 'Edit';
      },
      async clickedMapping({state, actions}, {key}) {
        let mapping = state.view.Modals.RulesModal.Mappings[key];
        let newState = false;
        if (!mapping.active) newState = true;
        state.view.Modals.RulesModal.Mappings[key].active = newState;
      },
      async handleHeaderClick({state}, {value}) {
        state.view.Modals.RulesModal.Edit.sortCol = value;

        let currentSort = state.view.Modals.RulesModal.Edit[value];
        if (currentSort && currentSort === 'ascending') {
          state.view.Modals.RulesModal.Edit[value] = 'descending';
        } else {
          state.view.Modals.RulesModal.Edit[value] = 'ascending';
        }
      },
      async viewMappings({state, actions}) {
        let obj = {};
        //Get and construct relevant mappings for this rule
        let tps = await actions.oadaHelper.getList('trading-partners');
        let selectedRule = state.view.Modals.RulesModal.Edit.rule;
        let inverse = false;
        let listType = selectedRule.mappings;
        if (!listType) return;
        if (listType === 'facilities') {
          inverse = true;
        }
        let list = await actions.oadaHelper.getList(listType);


        if (inverse) {
          // Loop over trading partners, and for each entry listed,
          // add an item to obj
          Object.values(tps).forEach((tp) => {
            Object.keys(tp[listType] || {}).forEach((masterid) => {
              let item = _.find(list, {masterid});
              let cityAndState = item.city && item.state ? true : false;
              obj[masterid] = obj[masterid] || {
                name: item.name + (cityAndState ? ' - '+(item.city +', '+item.state) : ''),
                active: false,
                partners: [],
              }
              let tpCityAndState = tp.city && tp.state ? true : false;
              let entry = tp.name+(tpCityAndState ? ' - '+tp.city+', '+tp.state : '');
              obj[masterid].partners.push(entry);
            })
          })

        } else {
          Object.keys(list).filter(key => key.charAt(0) !== '_').forEach((key) => {
            let cityAndState = list[key].city && list[key].state ? true : false;
            obj[key] = {
              name: list[key].name + (cityAndState ? ' - '+(list[key].city +', '+list[key].state) : ''),
              partners: Object.keys(list[key]['trading-partners'] || {}).map((masterid) => {
                let tp = _.find(tps, {masterid})
                if (!tp) return;
                let tpCityAndState = tp.city && tp.state ? true : false;
                return tp.name+(tpCityAndState ? ' - '+tp.city+', '+tp.state : '');
              }),
              active: false
            }
          })
        }
        obj = Object.values(obj);
        obj = _.compact(obj);
        //TODO: Remove this when the popup properly lists all of the entry's info
        obj = _.uniqBy(obj, x => x.name);
        obj = _.orderBy(obj, (item => item.name ? item.name.toLowerCase() : item.name));
        state.view.Modals.RulesModal.Mappings = obj;
        let options = {
          keys: [
            "name",
            "partners"
          ]
        };
        const myIndex = Fuse.createIndex(options.keys, obj);
        fuseSearch = new Fuse(obj, options, myIndex);
      },

      async handleResultSelect({state, actions}) {

      },

      async searchMappings({state, actions}, value) {
        state.view.Modals.RulesModal.Edit.mappingSearchValue = value;
        // fuseSearch created when mappings are initialized above
        let results = fuseSearch.search(value);
        state.view.Modals.RulesModal.Edit.mappingSearchResults = results.map(item => item.refIndex);
      },

      async doneClicked({state, actions}) {
        state.view.Modals.RulesModal.open = false;
        await actions.rules.createShare();
        await actions.rules.loadShares();

      },
      cancelClicked({state, actions}) {
        state.view.Modals.RulesModal.open = false;
        state.view.Modals.RulesModal.Edit = {rule: {}, template: {}};
      },
      deleteClicked({state, actions}, rule) {
        actions.rules.deleteShare(rule);
        actions.rules.loadShares();
        actions.view.Modals.RulesModal.cancelClicked();
      },
      searchChanged({state, actions}, result) {
        let newText = result.data.searchQuery;
        state.view.Modals.RulesModal.Edit.rule[result.key].searchQuery = {
          key: md5(JSON.stringify({name: newText})),
          name: newText
        }
      },
      textChanged({state, actions}, result) {
        let q = state.view.Modals.RulesModal.Edit.rule[result.key].searchQuery;
        let type = state.view.Modals.RulesModal.Edit.template[result.key].type;
        let list = state.rules[type];
        let values = result.values.map((key) =>
          q ? (key === q.key ? q : list[key]) : list[key]
        )
        state.view.Modals.RulesModal.Edit.rule[result.key].values = _.keyBy(values, 'key');
      },
    },
    FileDetailsModal: {
      onShareChange({state, actions}, data) {
      },
      onShareSearchChange({state, actions}, value) {
        state.view.Modals.FileDetailsModal.sharedSearchValue = value;
      },
      showDocument({state}, {resourceId}) {
        //Find document key for resourceId
        DOC_TYPES.forEach((docType) => {
          let docKey = _.chain(state.oadaHelper.data[docType]).findKey({_id: resourceId}).value();
          if (docKey) {
            state.view.Modals.FileDetailsModal.docKey = docKey;
            state.view.Modals.FileDetailsModal.docType = docType;
          }
        })
      },
      viewPDF({ state, actions }, {docKey, docType}) {
        state.view.Modals.PDFViewerModal.headers = {Authorization: 'Bearer '+state.oada.token}
        console.log('docType for testing: ', docType);
        if (docType === 'documents' || docType === 'application/pdf') {
          let _id = state.oada.data.documents[docKey]._id;
          state.view.Modals.PDFViewerModal.url = `${state.oada.url}/${_id}`
        } else {
          let tp = state.view.tp;
          let shared = state.oada.data[docType][docKey].shared ? 'shared' : 'bookmarks';
          let path = tp ? `${state.oadaHelper.path}/${shared}/trellisfw` : `/bookmarks/trellisfw`
          state.view.Modals.PDFViewerModal.url = `${state.oada.url}${path}/${docType}/${docKey}/_meta/vdoc/pdf`
        }
        state.view.Modals.PDFViewerModal.open = true;
      },
      downloadPDF({state, actions}, {docKey, docType}) {
        let url;

        if (docType === 'documents' || docType === 'application/pdf') {
          let _id = state.oada.data.documents[docKey]._id;
          url = `${state.oada.url}/${_id}`
        } else {
          let tp = state.view.tp;
          let shared = state.oada.data[docType][docKey].shared ? 'shared' : 'bookmarks';
          let path = tp ? `${state.oadaHelper.path}/${shared}/trellisfw` : `/bookmarks/trellisfw`
          url = `${state.oada.url}${path}/${docType}/${docKey}/_meta/vdoc/pdf`
        }
        return request.request({
          url: `${url}/_meta`,
          method: 'get',
          headers: {
            Authorization: 'Bearer ' + state.oada.token
          }
        }).then(response => {
          return _.get(response, 'data.filename');
        }).catch((err) => {
          return null;
        }).then((filename) => {
          if (filename == null) filename = 'file.pdf';
          return request.request({
            url: `${url}`,
            method: 'get',
            responseType: 'blob',
            headers: {
              Authorization: 'Bearer ' + state.oada.token
            }
          }).then(response => {
            //Download the pdf
            fileDownload(new Blob([response.data]), filename);
          });
        })
      },
      toggleShowData({ state }, docKey) {
        state.view.Modals.FileDetailsModal.showData = !state.view.Modals.FileDetailsModal.showData;
      },
      share({ state, actions }) {
        let tp = state.view.tp;
        let path = tp ? `${state.oadaHelper.path}/bookmarks/trellisfw` : `/bookmarks/trellisfw`
        //Share to all the share options
        const shareKeys = _.map(state.view.Modals.FileDetailsModal.share, (share, key) => {
          return key;
        });
        const docKey = state.view.Modals.FileDetailsModal.docKey;
        const docType = state.view.Modals.FileDetailsModal.docType;
        return Promise.map(shareKeys, (taskKey) => {
          return actions.oada.put({
            url: `${path}/${docType}/${docKey}/_meta/services/approval/tasks/${taskKey}`,
            data: {status: "approved"},
            headers: {
              'Content-Type': 'application/json',
            }
          });
        }, {concurrency: 1})
      },
      close({state, actions}) {
        //Close my window
        state.view.Modals.FileDetailsModal.open = false;
      },
      async approveFLDocument({state, actions}) {
        //1. Get document id
        let flDocId = await actions.oada.get({
          path: `${state.view.Modals.FileDetailsModal.document._meta.services['fl-sync'].document._id}`,
        }).then(r => _.get(r, ['data', 'food-logiq-mirror', '_id']));

        console.log('EXECUTING PUT', 
          `${fl_host}/v2/businesses/${sf_bus_id}/documents/${flDocId}/approvalStatus/approved`);
        //2. Execute PUT \
        if (flDocId) await request({
          method: 'put',
          url: `${fl_host}/v2/businesses/${sf_bus_id}/documents/${flDocId}/approvalStatus/approved`,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${fl_token}`,
          },
          data: {
            status: "Approved"
          }
        })
      },
    },
    PDFViewerModal: {
      nextPage({state}) {
        state.view.Modals.PDFViewerModal.pageNumber++;
      },
      previousPage({state}) {
        state.view.Modals.PDFViewerModal.pageNumber--;
      },
      onLoadSuccess({state, actions}, document) {
        let { numPages } = document;
        let { pageNumber } = document;
        state.view.Modals.PDFViewerModal.pageNumber = pageNumber || 1;
        state.view.Modals.PDFViewerModal.numPages = numPages;
      },
      download({state, actions}) {
        return request.request({
          url: state.view.Modals.PDFViewerModal.url,
          method: 'get',
          responseType: 'blob',
          headers: {
            Authorization: 'Bearer ' + state.oada.token
          }
        }).then(response => {
          //Download the pdf
          fileDownload(new Blob([response.data]), 'file.pdf');
        });
      },
      close({state, actions}) {
        //Close my window
        state.view.Modals.PDFViewerModal.open = false;
      }
    }
  },
  Pages: {
    Reports: {
      onStart({ state }, value) {
        const dt = moment(value, 'YYYY-MM-DD');
        if (dt.isValid()) {
          state.view.Pages.Reports.startDate = value;
        } else {
          state.view.Pages.Reports.startDate = '';
        }
      },
      onEnd({ state }, value) {
        const dt = moment(value, 'YYYY-MM-DD');
        if (dt.isValid()) {
          state.view.Pages.Reports.endDate = value;
        } else {
          state.view.Pages.Reports.endDate = '';
        }
      },

      reportSelect({ state, actions }, name) {
        actions.view.Pages.Reports.deselectAllReports();
        state.view.Pages.Reports.allSelected = false;
        state.view.Pages.Reports.selectedReport = name;
      },

      // TODO save different report types differently
      async saveReports({ state, actions }) {
        const selectedReport = state.view.Pages.Reports.selectedReport;
        if (!Object.keys(state.oada.data.Reports[selectedReport]).some((key) => {
          return state.oada.data.Reports[selectedReport][key].checked;
        })) {
          return;
        }
        await actions.view.Pages.Reports[selectedReport].Table.saveReports();
      },

      deselectAllReports({ state }) {
        const selectedReport = state.view.Pages.Reports.selectedReport;
        const dataState = state.oada.data.Reports[selectedReport];
        Object.keys(dataState).filter((date) => {
          return moment(date, 'YYYY-MM-DD').isValid();
        }).forEach((docKey) => {
          state.oada.data.Reports[selectedReport][docKey].checked = false;
        });
      },

      selectAllReports({ state, actions }) {
        const selectedReport = state.view.Pages.Reports.selectedReport;
        const tableState = state.view.Pages.Reports;
        const dataState = state.oada.data.Reports[selectedReport];
        const collection = tableState[selectedReport].Table;
        const docKeys = collection.map((row) => {
          return row.docKey;
        });
        actions.view.Pages.Reports.deselectAllReports();
        docKeys.forEach((docKey) => {
          dataState[docKey].checked = !dataState.allSelected;
        });
        dataState.allSelected = !dataState.allSelected;
      },

      eventLog: {
        Table: {
          loadDocumentKeys({ _state, actions }, documents) {
            console.log('Event Log - loadDocumentKeys', documents);
            let docKeys = Object.keys(documents);
            const validDates = docKeys.filter((key) => {
              return moment(key, 'YYYY-MM-DD').isValid()
            });
            return Promise.map(validDates, async (key) => {
              return actions.oadaHelper.loadEventLog(key);
            }, { concurrency: 5 });
          },

          toggleCheckbox({ state, actions }, date) {
            state.oada.data.Reports.eventLog[date].checked =
              !state.oada.data.Reports.eventLog[date].checked;
          },

          async saveReports({ state, actions }) {
            const myState = state.oada.data.Reports.eventLog;
            let wb = XLSX.utils.book_new();
            let rows = [];
            await Promise.each(
              Object.keys(myState)
                .filter((date) => myState[date] !== null
                  && myState[date] !== undefined)
                .filter((date) => myState[date].checked),
              async (date) => {
                let myRows = myState[date].data.rows;
                if (myRows === null || myRows === undefined) {
                  myRows = await actions.oadaHelper.getReportRows({
                    path: 'event-log',
                    date
                  });
                  myState[date].data.rows = myRows;
                }
                rows = rows.concat(myRows);
              });
            const ws = XLSX.utils.json_to_sheet(rows, {
              header: [
                'share status',
                'trading partner name',
                'trading partner masterid',
                'recipient email address',
                'event time',
                'event type',
                'document type',
                'document id',
                'source id',
                'document name',
                'upload date',
                'coi holder',
                'coi producer',
                'coi insured',
                'coi expiration date',
                'audit organization name',
                'audit expiration date',
                'audit score',
              ],
            });
            XLSX.utils.book_append_sheet(wb, ws, 'eventLog');
            XLSX.writeFile(wb, 'eventLog.xlsx', {
              bookType: 'xlsx',
            });
          },
        },
      },

      userAccess: {
        Table: {
          loadDocumentKeys({ _state, actions }, documents) {
            console.log('User Access - loadDocumentKeys', documents);
            let docKeys = Object.keys(documents);
            const validDates = docKeys.filter((key) => {
              return moment(key, 'YYYY-MM-DD').isValid();
            });
            return Promise.map(validDates, async (key) => {
              return actions.oadaHelper.loadUserAccess(key);
            }, { concurrency: 5 });
          },

          toggleCheckbox({ state, actions }, date) {
            state.oada.data.Reports.userAccess[date].checked =
              !state.oada.data.Reports.userAccess[date].checked;
          },

          async saveReports({ state, actions }) {
            const myState = state.oada.data.Reports.userAccess;
            let wb = XLSX.utils.book_new();
            await Promise.each(
              Object.keys(myState)
                .filter((date) => myState[date] !== null
                  && myState[date] !== undefined)
                .filter((date) => myState[date].checked),
              async (date) => {
                let myRows = myState[date].data.rows;
                if (myRows === undefined || myState == null) {
                  myRows = await actions.oadaHelper.getReportRows({
                    path: 'current-tradingpartnershares',
                    date,
                  });
                  myState[date].data.rows = myRows;
                }
                const ws = XLSX.utils.json_to_sheet(myRows, {
                  header: [
                    'trading partner name',
                    'trading partner masterid',
                    'document type',
                    'document id',
                    'source id',
                    'document name',
                    'upload date',
                    'coi holder',
                    'coi producer',
                    'coi insured',
                    'coi expiration date',
                    'audit organization name',
                    'audit expiration date',
                    'audit score',
                  ],
                });
                XLSX.utils.book_append_sheet(wb, ws, date);
              });
            XLSX.writeFile(wb, 'tradingPartnerAccess.xlsx', {
              bookType: 'xlsx',
            });
          },
        }
      },

      documentShares: {
        Table: {
          loadDocumentKeys({ _state, actions }, documents) {
            console.log('Document Shares - loadDocumentKeys', documents);
            let docKeys = Object.keys(documents);
            const validDates = docKeys.filter((key) => {
              return moment(key, 'YYYY-MM-DD').isValid();
            });
            return Promise.map(validDates, async (key) => {
              return actions.oadaHelper.loadDocumentShares(key);
            }, { concurrency: 5 });
          },

          toggleCheckbox({ state, actions }, date) {
            state.oada.data.Reports.documentShares[date].checked =
              !state.oada.data.Reports.documentShares[date].checked;
          },

          async saveReports({ state, actions }) {
            const myState = state.oada.data.Reports.documentShares;
            let wb = XLSX.utils.book_new();
            await Promise.each(
              Object.keys(myState)
                .filter((date) => myState[date] !== null
                  && myState[date] !== undefined)
                .filter((date) => myState[date].checked),
              async (date) => {
                let myRows = myState[date].data.rows;
                if (myRows === undefined || myState == null) {
                  myRows = await actions.oadaHelper.getReportRows({
                    path: 'current-shareabledocs',
                    date
                  });
                  myState[date].data.rows = myRows;
                }
                const ws = XLSX.utils.json_to_sheet(myRows, {
                  header: [
                    'document name',
                    'document id',
                    'source id',
                    'document type',
                    'upload date',
                    'trading partner name',
                    'trading partner masterid',
                    'coi holder',
                    'coi producer',
                    'coi insured',
                    'coi expiration date',
                    'audit organization name',
                    'audit expiration date',
                    'audit score',
                  ],
                });
                XLSX.utils.book_append_sheet(wb, ws, date);
              });
            XLSX.writeFile(wb, 'documentRecipientList.xlsx', {
              bookType: 'xlsx',
            });
          },
        }
      },
    },

    Audits: {
      onSearch({ state }, value) {
        state.view.Pages.Audits.search = value;
      },
      Table: {
        loadDocumentKeys({state, actions}, documents) {
          let docKeys = Object.keys(documents);
          console.log('Audits - loadDocumentKeys', docKeys)
          const docType = 'fsqa-audits';
          let keys = docKeys.sort();
          return Promise.map(keys, async (key) => {
            return actions.oadaHelper.loadDocument({docType, docKey: key, path: documents[key].path});
          }, {concurrency: 5})
        },
        async onRowClick({ state, actions }, {rowData}) {
          const docKey = rowData.docKey
          const docType = rowData.docType;
          console.log('Selected Document:')
          console.log('key', docKey, 'data', rowData)
          if (docKey == null) return; //Uploading doc
          const doc = state.oada.data[docType][docKey];
          //Show file detial model
          state.view.Modals.FileDetailsModal.docType = docType;
          state.view.Modals.FileDetailsModal.docKey = docKey;
          state.view.Modals.FileDetailsModal.open = true;
          state.view.Modals.FileDetailsModal.sharedWith = [];
          state.view.Modals.FileDetailsModal.sharedWith = await actions.oadaHelper.getTradingPartners({docType, docKey});
        }
      }
    },
    COIS: {
      onSearch({ state }, value) {
        state.view.Pages.COIS.search = value;
      },
      Table: {
        loadDocumentKeys({state, actions}, documents) {
          let docKeys = Object.keys(documents);
          const docType = 'cois';
          let keys = docKeys.sort();
          return Promise.map(keys, async (key) => {
            return actions.oadaHelper.loadDocument({docType, docKey: key, path: documents[key].path });
          }, {concurrency: 5})
        },
        async onRowClick({ state, actions }, {rowData}) {
          const docKey = rowData.docKey
          const docType = rowData.docType;
          console.log('Selected Document:')
          console.log('key', docKey, 'data', rowData)
          if (docKey == null) return; //Uploading doc
          const doc = state.oada.data[docType][docKey];
          //Show file detail model
          state.view.Modals.FileDetailsModal.docType = docType;
          state.view.Modals.FileDetailsModal.docKey = docKey;
          state.view.Modals.FileDetailsModal.open = true;
          state.view.Modals.FileDetailsModal.sharedWith = [];
          state.view.Modals.FileDetailsModal.sharedWith = await actions.oadaHelper.getTradingPartners({docType, docKey});
        }
      }
    },
    Certificates: {
      onSearch({ state }, value) {
        state.view.Pages.Certificates.search = value;
      },
      Table: {
        loadDocumentKeys({state, actions}, documents) {
          let docKeys = Object.keys(documents);
          console.log('Certificates - loadDocumentKeys', docKeys)
          const docType = 'fsqa-certificates';
          let keys = docKeys.sort();
          return Promise.map(keys, async (key) => {
            return actions.oadaHelper.loadDocument({docType, docKey: key, path: documents[key].path});
          }, {concurrency: 5})
        },
        async onRowClick({ state, actions }, {rowData}) {
          const docKey = rowData.docKey
          const docType = rowData.docType;
          console.log('Selected Document:')
          console.log('key', docKey, 'data', rowData)
          if (docKey == null) return; //Uploading doc
          const doc = state.oada.data[docType][docKey];
          //Show file detial model
          state.view.Modals.FileDetailsModal.docType = docType;
          state.view.Modals.FileDetailsModal.docKey = docKey;
          state.view.Modals.FileDetailsModal.open = true;
          state.view.Modals.FileDetailsModal.sharedWith = [];
          state.view.Modals.FileDetailsModal.sharedWith = await actions.oadaHelper.getTradingPartners({docType, docKey});
        }
      }
    },
    Data: {
      onSearch({ state }, value) {
        state.view.Pages.Data.search = value;
      },
      openFileBrowser({ state }) {
        state.view.Pages.Data.openFileBrowser = true;
        return Promise.delay(1000).then(() => {
          state.view.Pages.Data.openFileBrowser = false;
        })
      },
      Dropzone: {
        filesDropped({ state, actions }, files) {
          //TODO upload only 5 at a time
          //Start uploading the files
          return Promise.map(files, (file) => {
            //Add an `uploading` file
            const id = uuid();
            /*
            state.view.Pages.Data.uploading[id] = {
              filename: file.name,
              docKey: id,
            };
            */
            return actions.oadaHelper.uploadFile(file).then(() => {
//              delete state.view.Pages.Data.uploading[id];
            })
          });
        }
      },
      Table: {
        loadDocumentKeys({state, actions}, documents) {
          let docKeys = Object.keys(documents);
          console.log('Unidentified Files - loadDocumentKeys', docKeys)
          const docType = 'documents';
          let keys = docKeys.sort();
          return Promise.map(keys, async (key) => {
            console.log('LOADING', documents[key].path, docType, key)
            return actions.oadaHelper.loadDocument({docType, docKey: key, path: documents[key].path});
          }, {concurrency: 5})
        },
        async onRowClick({ state, actions }, props) {
          let {rowData, index} = props;
          const docKey = rowData.docKey
          let docType = rowData.docType;
          console.log('Selected Document:')
          console.log('key', docKey, 'data', rowData)
          if (docKey == null) return; //Uploading doc

          //If this is a PDF show pdf viewer
          switch(rowData.type) {
            case 'application/pdf':
              let tp = state.view.tp;
              let shared = rowData.shared ? 'shared' : 'bookmarks';
              let path = tp ? `${state.oadaHelper.path}/${shared}/trellisfw` : `/bookmarks/trellisfw`
              state.view.Modals.PDFViewerModal.headers = {Authorization: 'Bearer '+state.oada.token}
              let _id = state.oada.data.documents[docKey]._id;
              state.view.Modals.PDFViewerModal.url = `${state.oada.url}/${_id}`
              state.view.Modals.PDFViewerModal.open = true;
              state.view.MessageLog.path = `oada.data.documents.${docKey}`
              break;
          // Handle modal viewers for all other types
            default:
              let doc = state.oada.data.documents[docKey].identified;
              state.view.MessageLog.path = `oada.data.documents.${docKey}`
              state.view.Modals.FileDetailsModal.docType = doc.docType;
              state.view.Modals.FileDetailsModal.docKey = doc.docKey;
              state.view.Modals.FileDetailsModal.open = true;
              state.view.Modals.FileDetailsModal.sharedWith = [];
              state.view.Modals.FileDetailsModal.sharedWith = await actions.oadaHelper.getTradingPartners({docType: doc.docType, docKey:doc.docKey});
              break;
          }
        }
      }
    },
    Rules: {
      ruleSelected({state, actions}, rule) {
        state.view.Modals.EditRuleModal.open = true;
        state.view.Pages.Rules.selectedRule = rule;
      },
      addRuleClicked({state, actions}, rule) {
        state.view.Modals.RulesModal.open = true;
        state.view.Modals.RulesModal.page = 'List';
        state.view.Pages.Rules.selectedRule = rule;
      },
      async editRuleClicked({state, actions}, rule) {
        state.view.Modals.RulesModal.Edit = {
          template: json(rule),
          rule: json(rule),
          edit: true,
          key: rule.key,
        };
        await actions.view.Modals.RulesModal.viewMappings();
        state.view.Modals.RulesModal.page = 'Edit';
        state.view.Modals.RulesModal.open = true;
      }
    }
  },
  SideBar: {
    pageSelected({state, actions}, page) {
      state.view.Pages.lastSelectedPage = page;
    }
  }
}
