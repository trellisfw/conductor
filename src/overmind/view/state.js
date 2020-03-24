import _ from 'lodash'

export default {
  Pages: {
    selectedPage: 'Data',
    Data: {
      search: '',
      openFileBrowser: false,
      uploading: {}
    }
  },
  Modals: {
    FileDetailsModal: {
      open: false,
      documentKey: null,
      showData: false,
      document: ({ documentKey }, state) => {
        //Get the document
        return (
          _.chain(state)
            .get(`oada.data.documents.${documentKey}`)
            .value() || {}
        )
      },
      audit: ({ document }, state) => {
        //Get the audit from the doc
        return (
          _.chain(document)
            .get(`audits`)
            .values()
            .get(0)
            .value() || {}
        )
      },
      coi: ({ document }, state) => {
        //Get the cois from the doc
        return (
          _.chain(document)
            .get(`cois`)
            .values()
            .get(0)
            .value() || {}
        )
      },
      share: ({ document }, state) => {
        return (
          _.chain(document)
            .get(`_meta.services.approval.tasks`)
            .value() || {}
        )
      }
    },
    PDFViewerModal: {
      open: false
    }
  }
}
