import _ from 'lodash';
import Fuse from 'fuse.js';
import md5 from 'md5';
import uuid from 'uuid/v4';
import Promise from 'bluebird';
import {json} from 'overmind';
import fileDownload from 'js-file-download';
import request from 'axios'

let DOC_TYPES = ['cois', 'fsqa-certificates', 'fsqa-audits', 'letters-of-guarantee', 'documents'];
export default {
  TopBar: {
    logout({state, actions}) {
      actions.login.logout()
      actions.oada.logout();
    }
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
      async viewMappings({state, actions}) {
        let obj = {};
        //Get and construct relevant mappings for this rule
        let tps = await actions.oada.tradingPartners();
        let selectedRule = state.view.Modals.RulesModal.Edit.rule;
        if (selectedRule.mappings && selectedRule.mappings === 'holders') {
          let holders = await actions.oada.holders();
          Object.keys(holders).forEach((key) => {
            obj[key] = {
              name: holders[key].name+ ' - '+holders[key].city+', '+holders[key].state,
              partners: Object.keys(holders[key]['trading-partners'] || {}).map((masterid) => {
                let item = _.find(tps, {masterid})
                return item.name+' - '+item.city+', '+item.state
              }),
              active: false
            }
          })
          obj = Object.values(obj);
          obj = _.orderBy(obj, (item => item.name ? item.name.toLowerCase() : item.name));
          state.view.Modals.RulesModal.Mappings = obj;
        } else if (selectedRule.mappings && selectedRule.mappings === 'facilities') {
          let facilities = await actions.oada.facilities();
          // Loop over trading partners, and for each facility listed,
          // add an item to obj
          Object.values(tps).forEach((v) => {
            Object.keys(v.facilities || {}).forEach((masterid) => {
              let fac = _.find(facilities, {masterid});
              obj[masterid] = {
                name: fac.name,
                active: false,
              }
              let entry = v.name+' - '+v.city+', '+v.state;
              obj[masterid].partners = obj[masterid].partners ? obj[masterid].partners.push(entry) : [entry];
            })
          })
          obj = Object.values(obj);
          obj = _.orderBy(obj, (item => item.name ? item.name.toLowerCase() : item.name));
          state.view.Modals.RulesModal.Mappings = obj;
        } else if (selectedRule.mappings && selectedRule.mappings === 'buyers') {
          let buyers = await actions.oada.buyers();
          Object.keys(buyers).forEach((key) => {
            obj[key] = {
              name: buyers[key].name,
              partners: Object.keys(buyers[key]['trading-partners'] || {}).map((masterid) => {
                let item = _.find(tps, {masterid})
                return item.name+' - '+item.city+', '+item.state
              }),
              active: false
            }
          })
          obj = Object.values(obj);
          obj = _.orderBy(obj, (item => item.name ? item.name.toLowerCase() : item.name));
          state.view.Modals.RulesModal.Mappings = obj;
        }
        console.log('RESULT', obj)
      },

      async handleResultSelect({state, actions}) {

      },

      async searchMappings({state, actions}, value) {
        state.view.Modals.RulesModal.Edit.mappingSearchValue = value;
        let mappings = state.view.Modals.RulesModal.Mappings;
        let options = {
          keys: [
            "name",
            "partners"
          ]
        };
        const fuse = new Fuse(mappings, options);
        let results = fuse.search(value);
        console.log('SEARCH', results);
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
      state.view.Pages.selectedPage = page;
    },
  }
}
