import _ from 'lodash'

export default {
  rules: [
    {
      text: "When a input0 is from input1, send it to input2",
      input0: 'Document',
      input1: 'Location',
      input2: 'Partner',
      categories: ['FSQA', 'PII'],
    }, {
      text: 'When a input0 is expired, notify input1',
      input0: 'Document', 
      input1: 'Partner',
      categories: ['FSQA', 'PII'],
    }, {
      text: 'When a input0 has an input1 greater than input2, mark it as input3',
      input0: 'Document', 
      input1: 'Property',
      input2: 'Value',
      input3: 'Value',
      categories: ['FSQA', 'PII'],
    }, {
      text: 'When a input0, has a input1 of input2, send it to input3',
      input0: 'Document',
      input1: 'Property',
      input2: 'Partner',
      input3: 'Partner',
      categories: ['FSQA', 'PII'],
    }
  ], 
  Document: {
    enum: ['Audit', 'Certificate of Insurance', 'Advance Shipping Notice'],
  },
  Partner: {
    enum: ['Tyson', `McDonald\'s`, 'Wakefern'],
  },
  Location: {
    enum: ['Arnold', 'Cudahy', 'North', 'Springfield', 'Sioux City', 'Charlotte', 'Cincinatti'],
  },
  Value: {
    enum: []
  },
  Property: {
    enum: []
  },
}
