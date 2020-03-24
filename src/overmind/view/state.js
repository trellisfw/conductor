import _ from 'lodash'

export default {
  Pages: {
    selectedPage: 'Data',
    Data: {
      search: '',
      uploading: {}
    },
    Rules: {
    }
  },
  Modals: {
    EditRuleModal: {
      open: false,
    },
    NewRuleModal: {
      open: false,
      page: 'List',
      List: {
        category: 'FSQA',
        categories: ['FSQA','PII','Claims','Sustainability','Supply Chain'],
      },
      Edit: {
        template: {},
        rule: {},
      },
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
