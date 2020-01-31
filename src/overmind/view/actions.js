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
      viewPDF({ state, actions }, documentKey) {
        state.view.Modals.PDFViewerModal.headers = {Authorization: 'Bearer '+state.oada.token}
        state.view.Modals.PDFViewerModal.url = `${state.oada.url}/bookmarks/trellisfw/documents/${documentKey}/pdf`
        state.view.Modals.PDFViewerModal.open = true;
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
    Files: {
      Dropzone: {
        filesDropped({ state, actions }, files) {
            //Start uploading the files
            return Promise.map(files, (file) => {
              //Add an `uploading` file
              const id = uuid();
              state.view.Pages.Files.uploading[id] = {
                filename: file.name
              };
              return actions.oada.uploadFile(file).then(() => {
                delete state.view.Pages.Files.uploading[id];
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
