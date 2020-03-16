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
          total: 5,
          createdBy: 'Michael Gaspers',
          created: '12-12-2019',
        },
        def: {
          text: [['When a', 'has a ', ' of','send it to' ],
            ['Certificate of Insurance', 'Certificate Holder', 'Tyson', 'Tyson']],
          total: 8,
          createdBy: 'Michael Gaspers',
          created: '09-28-2019',
        },
        ghi: {
          text: [['When a', 'has a', 'of', 'send it to'],
          ['Food Safety Audit', 'Product', 'Bacon', `McDonald\'s`]],
          total: 15,
          createdBy: 'Michael Gaspers',
          created: '11-14-2019',
        },
        jkl: {
          text: [['When a', 'has an', 'greater than', 'mark it as'],
            ['Food Safety Audit', 'Overall Score','90%', 'Approved']],
          total: 2,
          createdBy: 'Michael Gaspers',
          created: '08-07-2019',
        },
      }
    }
  },
  Modals: {
    EditRuleModal: {
      open: false,
    },
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
