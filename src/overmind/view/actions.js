import _ from 'lodash';
import uuid from 'uuid/v4';
import Promise from 'bluebird';
import {json} from 'overmind';
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
      textChanged({state, actions}, result) {
        console.log(result);
        let type = state.view.Modals.NewRuleModal.Edit.template[result.key].type;
        let list = state.rules[type];
        let values = result.values.map((key) => list[key])
        state.view.Modals.NewRuleModal.Edit.rule[result.key].values = _.keyBy(values, 'key');
      },
    },
    FileDetailsModal: {
      onShareChange({state, actions}, data) {
      },
      showDocument({state}, {resourceId}) {
        //Find document key for resourceId
        let docKey = _.chain(state.oada.data.documents).findKey({_id: resourceId}).value();
        if (docKey) {
          state.view.Modals.FileDetailsModal.documentKey = docKey;
        }
      },
      viewPDF({ state, actions }, documentKey) {
        state.view.Modals.PDFViewerModal.headers = {Authorization: 'Bearer '+state.oada.token}
        state.view.Modals.PDFViewerModal.url = `${state.oada.url}/bookmarks/trellisfw/documents/${documentKey}/pdf`
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
        return Promise.map(shareKeys, (taskKey) => {
          return actions.oada.put({
            url: `/bookmarks/trellisfw/documents/${documentKey}/_meta/services/approval/tasks/${taskKey}`,
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
            })
        }
      },
      Table: {
        onRowClick({ state, actions }, {rowData}) {
          const documentKey = rowData.documentKey;
          if (documentKey == null) return; //Uploading doc
          const doc = state.oada.data.documents[documentKey];
          if (doc.pdf != null) {
            //Set view data for audit modal
            state.view.Modals.FileDetailsModal.documentKey = documentKey;
            state.view.Modals.FileDetailsModal.open = true;
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
