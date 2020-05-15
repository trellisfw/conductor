import _ from 'lodash';
import md5 from 'md5';
import uuid from 'uuid/v4';
import Promise from 'bluebird';
import {json} from 'overmind';
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
    NewRuleModal: {
      backClicked({state, actions}) {
        state.view.Modals.NewRuleModal.page = 'List';
      },
      close({state, actions}) {
        state.view.Modals.NewRuleModal.open = false;
      },
      categorySelected({state, actions}, evt) {
        state.view.Modals.NewRuleModal.category = evt.target;
      },
      newRuleSelected({state, actions}, rule) {
        state.view.Modals.NewRuleModal.Edit = {
          template: json(rule),
          rule: json(rule)
        };
        state.view.Modals.NewRuleModal.page = 'Edit';
      },
      async doneClicked({state, actions}) {
        state.view.Modals.NewRuleModal.open = false;
        await actions.rules.createShare();
        await actions.rules.loadShares();

      },
      cancelClicked({state, actions}) {
        state.view.Modals.NewRuleModal.open = false;
        state.view.Modals.NewRuleModal.Edit = {rule: {}, template: {}};
      },
      deleteClicked({state, actions}, rule) {
        actions.rules.deleteShare(rule);
        actions.rules.loadShares();
        actions.view.Modals.NewRuleModal.cancelClicked();
      },
      searchChanged({state, actions}, result) {
        let newText = result.data.searchQuery;
        state.view.Modals.NewRuleModal.Edit.rule[result.key].searchQuery = {
          key: md5(JSON.stringify({name: newText})),
          name: newText
        }
      },
      textChanged({state, actions}, result) {
        let q = state.view.Modals.NewRuleModal.Edit.rule[result.key].searchQuery;
        let type = state.view.Modals.NewRuleModal.Edit.template[result.key].type;
        let list = state.rules[type];
        let values = result.values.map((key) =>
          q ? (key === q.key ? q : list[key]) : list[key]
        )
        state.view.Modals.NewRuleModal.Edit.rule[result.key].values = _.keyBy(values, 'key');
      },
    },
    FileDetailsModal: {
      onShareChange({state, actions}, data) {
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
        const pdfResource = _.get(state.oada.data, `${docType}.${documentKey}._meta.vdoc.pdf._id`)
        state.view.Modals.PDFViewerModal.headers = {Authorization: 'Bearer '+state.oada.token}
        state.view.Modals.PDFViewerModal.url = `${state.oada.url}/${pdfResource}`
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
      close({state, actions}) {
        //Close my window
        state.view.Modals.PDFViewerModal.open = false;
      }
    }
  },
  Pages: {
    Audits: {
      onSearch({ state }, value) {
        state.view.Pages.Data.search = value;
      },
      Table: {
        loadMoreRows({state, actions}, {startIndex, stopIndex, docType}) {
          //Load parsed COI data and it's meta
          const table = _.get(state, `view.Pages.Audits.Table`);
          let keys = _.map(_.slice(table, startIndex, stopIndex+1), 'documentKey')
          keys = keys.sort();
          return Promise.map(keys, async (key) => {
            await actions.oada.loadDocument({docType, documentId: key})
          }, {concurrency: 5})
        },
        async onRowClick({ state, actions }, {rowData}) {
          const documentKey = rowData.documentKey
          const docType = rowData.docType;
          console.log('Selected Document:')
          console.log('key', documentKey, 'data', rowData)
          if (documentKey == null) return; //Uploading doc
          const doc = state.oada.data[docType][documentKey];
          console.log('doc', doc)
          //Show file detial model
          state.view.Modals.FileDetailsModal.docType = docType;
          state.view.Modals.FileDetailsModal.documentKey = documentKey;
          state.view.Modals.FileDetailsModal.open = true;
          /*
          await actions.oada.getTradingPartners({docType, documentKey});*/
        }
      }
    },
    COIS: {
      onSearch({ state }, value) {
        state.view.Pages.Data.search = value;
      },
      Table: {
        loadMoreRows({state, actions}, {startIndex, stopIndex, docType}) {
          //Load parsed COI data and it's meta
          const table = _.get(state, `view.Pages.COIS.Table`);
          let keys = _.map(_.slice(table, startIndex, stopIndex+1), 'documentKey')
          keys = keys.sort();
          return Promise.map(keys, async (key) => {
            await actions.oada.loadDocument({docType, documentId: key})
          }, {concurrency: 5})
        },
        async onRowClick({ state, actions }, {rowData}) {
          const documentKey = rowData.documentKey
          const docType = rowData.docType;
          console.log('Selected Document:')
          console.log('key', documentKey, 'data', rowData)
          if (documentKey == null) return; //Uploading doc
          const doc = state.oada.data[docType][documentKey];
          console.log('doc', doc)
          //Show file detial model
          state.view.Modals.FileDetailsModal.docType = docType;
          state.view.Modals.FileDetailsModal.documentKey = documentKey;
          state.view.Modals.FileDetailsModal.open = true;
          /*
          await actions.oada.getTradingPartners({docType, documentKey});*/
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
        loadMoreRows({state, actions}, {startIndex, stopIndex, docType}) {
          //Load meta of pdfs to get their filename
          const table = _.get(state, `view.Pages.Data.Table`);
          let keys = _.map(_.slice(table, startIndex, stopIndex+1), 'documentKey')
          keys = keys.sort();
          return Promise.map(keys, async (key) => {
            await actions.oada.loadMeta({docType, documentId: key})
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
        state.view.Modals.NewRuleModal.open = true;
        state.view.Modals.NewRuleModal.page = 'List';
        state.view.Pages.Rules.selectedRule = rule;
      },
      editRuleClicked({state, actions}, rule) {
        state.view.Modals.NewRuleModal.Edit = {
          template: json(rule),
          rule: json(rule),
          edit: true,
          key: rule.key,
        };
        state.view.Modals.NewRuleModal.page = 'Edit';
        state.view.Modals.NewRuleModal.open = true;
      }
    }
  },
  SideBar: {
    pageSelected({state, actions}, page) {
      state.view.Pages.selectedPage = page;
    },
  }
}
