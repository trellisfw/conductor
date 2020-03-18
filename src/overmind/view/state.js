import _ from 'lodash'
import rules from './rules.state.js';

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
          input0: 'Food Safety Audit', 
          input1: 'Arnold, Cudahy, or North',
          input2: 'Tyson',
          total: 5,
          createdBy: 'Michael Gaspers',
          created: '12-12-2019',
        },
        def: {
          text: 'When a input0 has a input1 of input2, send it to input3',
          input0: 'Certificate of Insurance', 
          input1: 'Certificate Holder', 
          input2: 'Tyson',
          input3: 'Tyson',
          total: 8,
          createdBy: 'Michael Gaspers',
          created: '09-28-2019',
        },
        ghi: {
          text: 'When a input0 has a input1 of input2, send it to input3',
          input0: 'Food Safety Audit',
          input1: 'Product',
          input2: 'Bacon', 
          input3: `McDonald\'s`,
          total: 15,
          createdBy: 'Michael Gaspers',
          created: '11-14-2019',
        },
        jkl: {
          text: 'When a input0 has an input1 greater than input2 mark it as input3',
          input0: 'Food Safety Audit',
          input1: 'Overall Score',
          input2: '90%', 
          input3: 'Approved',
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
        rules,
      },
      Edit: {
        template: {
          text: "When a input0 is from input1, send it to input2",
          input0: 'Document',
          input1: 'Location',
          input2: 'Partner',
          categories: ['FSQA', 'PII'],
        },
        rule: {
          input0: 'Document',
          input1: 'Location',
          input2: 'Partner',
          categories: ['FSQA', 'PII'],
        },
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
