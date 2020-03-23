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
          text:'When a input0 is from input1, send it to input2.',
          input0: ['Food Safety Audit'], 
          input1: ['Arnold, PA', 'Cudahy', 'North'],
          input2: ['Tyson'],
          total: 5,
          createdBy: 'Michael Gaspers',
          created: '12-12-2019',
        },
        def: {
          text: 'When a input0 has a input1 of input2, send it to input3',
          input0: ['Certificate of Insurance'],
          input1: ['Certificate Holder'], 
          input2: ['Tyson'],
          input3: ['Tyson'],
          total: 8,
          createdBy: 'Michael Gaspers',
          created: '09-28-2019',
        },
        ghi: {
          text: 'When a input0 has a Product of input1, send it to input2',
          input0: ['Food Safety Audit'],
          input1: ['Bacon'], 
          input2: [`McDonald\'s`],
          total: 15,
          createdBy: 'Michael Gaspers',
          created: '11-14-2019',
        },
        jkl: {
          text: 'When a input0 has an overall score greater than input1 mark it as input2',
          input0: ['Food Safety Audit'],
          input1: ['90%'], 
          input2: ['Approved'],
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
