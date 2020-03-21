import _ from 'lodash';
import uuid from 'uuid/v4';
import Promise from 'bluebird';
export default {
  TopBar: {
    logout({state, actions}) {
      actions.login.logout()
      actions.oada.logout();
    }
  },
  Modals: {
    FileDetailsModal: {
      onShareChange({state, actions}, data) {
        console.log('share', data)
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
    }
  }
}
