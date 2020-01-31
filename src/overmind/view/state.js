import _ from 'lodash';

export default {
  Pages: {
    selectedPage: 'Files',
    Files: {
      search: '',
      uploading: {}
    }
  },
  Modals: {
    FileDetailsModal: {
      open: false,
      documentKey: null,
      audit: ({documentKey}, state) => {
        //Get the audit from the doc
        return  _.chain(state).get(`oada.data.documents.${documentKey}.audits`).values().get(0).value() || {};
      },
      coi: ({documentKey}, state) => {
        //Get the cois from the doc
        return  _.chain(state).get(`oada.data.documents.${documentKey}.cois`).values().get(0).value() || {};
      },
      share: ({documentKey}, state) => {
        return  _.chain(state).get(`oada.data.documents.${documentKey}._meta.services.approval.tasks`).value() || {};
      }
    },
    PDFViewerModal: {
      open: false
    }
  }
}
