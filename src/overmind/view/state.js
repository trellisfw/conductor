import _ from 'lodash'

export default {
  Pages: {
    selectedPage: 'Data',
    Data: {
      search: '',
      uploading: {}
    },
    Rules: {
      rules: {
        abc: {
          text:[['When a', 'is from', 'send it to'],
            ['Food Safety Audit', 'Arnold, Cudahy, or North,', 'Tyson']],
        },
        def: {
          text: [['When a', 'has a ', ' of','send it to' ],
            ['Certificate of Insurance', 'Certificate Holder', 'Tyson']],
        },
        ghi: {
          text: [['When a', 'has a', 'of', 'send it to'],
          ['Food Safety Audit', 'Product', 'Bacon', 'McDonald\'s']],
        },
        jkl: {
          text: [['When a', 'has an', 'greater than', 'mark it as'],
            ['Food Safety Audit', 'Overall Score','90%', 'Approved']],
        },
      }
    }
  },
  Modals: {
    FileDetailsModal: {
      open: false,
      documentKey: null,
      showData: false,
      audit: ({ documentKey }, state) => {
        //Get the audit from the doc
        return (
          _.chain(state)
            .get(`oada.data.documents.${documentKey}.audits`)
            .values()
            .get(0)
            .value() || {}
        )
      },
      'audit-masked': ({ documentKey }, state) => {
        //Get the audit from the doc
        return (
          _.chain(state)
            .get(`oada.data.documents.${documentKey}.audits-masked`)
            .values()
            .get(0)
            .value() || {}
        )
      },
      coi: ({ documentKey }, state) => {
        //Get the cois from the doc
        return (
          _.chain(state)
            .get(`oada.data.documents.${documentKey}.cois`)
            .values()
            .get(0)
            .value() || {}
        )
      },
      share: ({ documentKey }, state) => {
        return (
          _.chain(state)
            .get(
              `oada.data.documents.${documentKey}._meta.services.approval.tasks`
            )
            .value() || {}
        )
      }
    },
    PDFViewerModal: {
      open: false
    }
  }
}
