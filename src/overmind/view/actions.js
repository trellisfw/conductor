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

let DOC_TYPES = ['cois', 'fsqa-certificates', 'fsqa-audits', 'letters-of-guarantee', 'documents'];
let fuseSearch;
export default {
  TopBar: {
    logout({state, actions}) {
      actions.login.logout()
      actions.oada.logout();
    },
    changeTp({state, actions}, props) {
      state.view.tp = state.tps[props].name;
      state.oada.path = `/bookmarks/trellisfw/trading-partners/${props}/bookmarks/trellisfw`
      actions.oada.initializeDocuments();
    },
  },
  Modals: {
    EditRuleModal: {
      close({state, actions}) {
        state.view.Modals.EditRuleModal.open = false;
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
        let tps = await actions.oada.getList('trading-partners');
        let selectedRule = state.view.Modals.RulesModal.Edit.rule;
        let inverse = false;
        let listType = selectedRule.mappings;
        if (!listType) return;
        if (listType === 'facilities') {
          inverse = true;
        }
        let list = await actions.oada.getList(listType);


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
        console.log('start')
        let results = fuseSearch.search(value);
        console.log('end')
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
          let docKey = _.chain(state.oada.data[docType]).findKey({_id: resourceId}).value();
          if (docKey) {
            state.view.Modals.FileDetailsModal.documentKey = docKey;
            state.view.Modals.FileDetailsModal.docType = docType;
          }
        })
      },
      viewPDF({ state, actions }, {documentKey, docType}) {
        state.view.Modals.PDFViewerModal.headers = {Authorization: 'Bearer '+state.oada.token}
        state.view.Modals.PDFViewerModal.url = `${state.oada.url}/bookmarks/trellisfw/${docType}/${documentKey}/_meta/vdoc/pdf`
        state.view.Modals.PDFViewerModal.open = true;
      },
      downloadPDF({state, actions}, {documentKey, docType}) {
        return request.request({
          url: `${state.oada.url}/bookmarks/trellisfw/${docType}/${documentKey}/_meta/vdoc/pdf/_meta`,
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
            url: `${state.oada.url}/bookmarks/trellisfw/${docType}/${documentKey}/_meta/vdoc/pdf`,
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
      toggleShowData({ state }, documentKey) {
        state.view.Modals.FileDetailsModal.showData = !state.view.Modals.FileDetailsModal.showData;
      },
      share({ state, actions }) {
        //Share to all the share options
        const shareKeys = _.map(state.view.Modals.FileDetailsModal.share, (share, key) => {
          return key;
        });
        const documentKey = state.view.Modals.FileDetailsModal.documentKey;
        const docType = state.view.Modals.FileDetailsModal.docType;
        return Promise.map(shareKeys, (taskKey) => {
          return actions.oada.put({
            url: `/bookmarks/trellisfw/${docType}/${documentKey}/_meta/services/approval/tasks/${taskKey}`,
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
      }
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
        // console.log('value: ', value);
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
        }).forEach((documentKey) => {
          state.oada.data.Reports[selectedReport][documentKey].checked = false;
        });
      },

      selectAllReports({ state, actions }) {
        const selectedReport = state.view.Pages.Reports.selectedReport;
        const tableState = state.view.Pages.Reports;
        const dataState = state.oada.data.Reports[selectedReport];
        const collection = tableState[selectedReport].Table;
        const documentKeys = collection.map((row) => {
          return row.documentKey;
        });
        actions.view.Pages.Reports.deselectAllReports();
        documentKeys.forEach((documentKey) => {
          dataState[documentKey].checked = !dataState.allSelected;
        });
        dataState.allSelected = !dataState.allSelected;
      },

      eventLog: {
        Table: {
          loadDocumentKeys({ _state, actions }, documentKeys) {
            console.log('Event Log - loadDocumentKeys', documentKeys);
            const validDates = documentKeys.filter((key) => {
              return moment(key, 'YYYY-MM-DD').isValid()
            });
            return Promise.map(validDates, async (key) => {
              return actions.oada.loadEventLog(key);
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
                  myRows = await actions.oada.getReportRows({
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
          loadDocumentKeys({ _state, actions }, documentKeys) {
            console.log('User Access - loadDocumentKeys', documentKeys);
            const validDates = documentKeys.filter((key) => {
              return moment(key, 'YYYY-MM-DD').isValid();
            });
            return Promise.map(validDates, async (key) => {
              return actions.oada.loadUserAccess(key);
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
                  myRows = await actions.oada.getReportRows({
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
          loadDocumentKeys({ _state, actions }, documentKeys) {
            console.log('Document Shares - loadDocumentKeys', documentKeys);
            const validDates = documentKeys.filter((key) => {
              return moment(key, 'YYYY-MM-DD').isValid();
            });
            return Promise.map(validDates, async (key) => {
              return actions.oada.loadDocumentShares(key);
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
                  myRows = await actions.oada.getReportRows({
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
        loadDocumentKeys({state, actions}, documentKeys) {
          console.log('Audits - loadDocumentKeys', documentKeys)
          const docType = 'fsqa-audits';
          let keys = documentKeys.sort();
          return Promise.map(keys, async (key) => {
            return actions.oada.loadDocument({docType, documentId: key});
          }, {concurrency: 5})
        },
        async onRowClick({ state, actions }, {rowData}) {
          const documentKey = rowData.documentKey
          const docType = rowData.docType;
          console.log('Selected Document:')
          console.log('key', documentKey, 'data', rowData)
          if (documentKey == null) return; //Uploading doc
          const doc = state.oada.data[docType][documentKey];
          //Show file detial model
          state.view.Modals.FileDetailsModal.docType = docType;
          state.view.Modals.FileDetailsModal.documentKey = documentKey;
          state.view.Modals.FileDetailsModal.open = true;
          state.view.Modals.FileDetailsModal.sharedWith = [];
          state.view.Modals.FileDetailsModal.sharedWith = await actions.oada.getTradingPartners({docType, documentKey});
        }
      }
    },
    COIS: {
      onSearch({ state }, value) {
        state.view.Pages.COIS.search = value;
      },
      Table: {
        loadDocumentKeys({state, actions}, documentKeys) {
          const docType = 'cois';
          let keys = documentKeys.sort();
          return Promise.map(keys, async (key) => {
            console.log('loading', key);
            return actions.oada.loadDocument({docType, documentId: key});
          }, {concurrency: 5})
        },
        async onRowClick({ state, actions }, {rowData}) {
          const documentKey = rowData.documentKey
          const docType = rowData.docType;
          console.log('Selected Document:')
          console.log('key', documentKey, 'data', rowData)
          if (documentKey == null) return; //Uploading doc
          const doc = state.oada.data[docType][documentKey];
          //Show file detial model
          state.view.Modals.FileDetailsModal.docType = docType;
          state.view.Modals.FileDetailsModal.documentKey = documentKey;
          state.view.Modals.FileDetailsModal.open = true;
          state.view.Modals.FileDetailsModal.sharedWith = [];
          state.view.Modals.FileDetailsModal.sharedWith = await actions.oada.getTradingPartners({docType, documentKey});
        }
      }
    },
    Certificates: {
      onSearch({ state }, value) {
        state.view.Pages.Certificates.search = value;
      },
      Table: {
        loadDocumentKeys({state, actions}, documentKeys) {
          console.log('Certificates - loadDocumentKeys', documentKeys)
          const docType = 'fsqa-certificates';
          let keys = documentKeys.sort();
          return Promise.map(keys, async (key) => {
            return actions.oada.loadDocument({docType, documentId: key});
          }, {concurrency: 5})
        },
        async onRowClick({ state, actions }, {rowData}) {
          const documentKey = rowData.documentKey
          const docType = rowData.docType;
          console.log('Selected Document:')
          console.log('key', documentKey, 'data', rowData)
          if (documentKey == null) return; //Uploading doc
          const doc = state.oada.data[docType][documentKey];
          //Show file detial model
          state.view.Modals.FileDetailsModal.docType = docType;
          state.view.Modals.FileDetailsModal.documentKey = documentKey;
          state.view.Modals.FileDetailsModal.open = true;
          state.view.Modals.FileDetailsModal.sharedWith = [];
          state.view.Modals.FileDetailsModal.sharedWith = await actions.oada.getTradingPartners({docType, documentKey});
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
            state.view.Pages.Data.uploading[id] = {
              filename: file.name
            };
            return actions.oada.uploadFile(file).then(() => {
              delete state.view.Pages.Data.uploading[id];
            })
          });
        }
      },
      Table: {
        loadDocumentKeys({state, actions}, documentKeys) {
          console.log('Unidentified Files - loadDocumentKeys', documentKeys)
          const docType = 'documents';
          let keys = documentKeys.sort();
          return Promise.map(keys, async (key) => {
            return actions.oada.loadDocument({docType, documentId: key});
          }, {concurrency: 5})
        },
        async onRowClick({ state, actions }, {rowData}) {
          const documentKey = rowData.documentKey
          const docType = rowData.docType;
          console.log('Selected Document:')
          console.log('key', documentKey, 'data', rowData)
          if (documentKey == null) return; //Uploading doc

          //If this is a PDF show pdf viewer
          if (rowData.type == 'application/pdf') {
            state.view.Modals.PDFViewerModal.headers = {Authorization: 'Bearer '+state.oada.token}
            state.view.Modals.PDFViewerModal.url = `${state.oada.url}/bookmarks/trellisfw/documents/${documentKey}`
            state.view.Modals.PDFViewerModal.open = true;
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
