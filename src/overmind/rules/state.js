import _ from 'lodash'
const FL_BUSINESS_ID = 'abc';

export default {
  templates: {
    temp0: {
      id: 'temp0',
      text: "When an Audit from input0 has a Location of input1 and a Product of input2, sync it to Food Logiq",
      input0: {
        type: 'Partner',
        values: [],
      },
      input1: {
        type: 'Location',
        values: [],
      },
      input2: {
        type: 'Product',
        values: [],
      },
      categories: ['FSQA', 'PII'],
      share: {
        type: 'fl',
        partners: 'input0',
        locations: 'input1',
        id: 'input1',
        products: 'input2', 
        shares: {
          [FL_BUSINESS_ID]: {
            communities: []
          }
        }
      }
    },
    temp1: {
      id: 'temp1',
      text: "When an Audit has a Product of input0, email it to input1",
      input0: 'Product',
      input1: 'Partner',
      categories: ['FSQA', 'PII'],
      share: ({input0, input1}, state) => {
        return {
          type: 'email',
          products: input0,
          partners: input1,
          email: state.partners[input1] ? state.partners[input1].email : '',
        }
      }
    }, 
    temp2: {
      id: 'temp2',
      text: "When an Audit has a Location ofinput0, sync it to input1 on Food Logiq",
      input0: 'Location',
      input1: 'Partner',
      categories: ['FSQA', 'PII'],
      share: ({input0, input1}, state) => {
        return {
          type: 'fl',
          products: input0,
          partners: input1,
          email: state.partners[input1] ? state.partners[input1].email : '',
        }
      }
    },
    /*
    temp3: {
      text: 'When a input0 is expired, notify input1',
      input0: 'Document', 
      input1: 'Partner',
      categories: ['FSQA', 'PII'],
      share: {
        type: 'fl',
        partners: (state) => state.rules.rules.temp1.input1,
        to: (state) => state.partners[state.rules.rules.temp1.input1].email,
      }
    },
    temp4: {
      text: 'When a input0 has an input1 greater than input2, mark it as input3',
      input0: 'Document', 
      input1: 'Property',
      input2: 'Value',
      input3: 'Value',
      categories: ['FSQA', 'PII'],
    }, 
    temp5: {
      text: 'When a input0, has a input1 of input2, send it to input3',
      input0: 'Document',
      input1: 'Property',
      input2: 'Partner',
      input3: 'Partner',
      categories: ['FSQA', 'PII'],
    },
    */
  },
  Document: 
    ['Audit', 'Certificate of Insurance', 'Advance Shipping Notice'],
  Partner: 
    ['Tyson', `McDonald\'s`, 'Wakefern'],
  Location:
    ['Arnold, PA', 'Cudahy, ', '(North) Smithfield, VA', 'Springfield', 'Sioux City, IA', 'Charlotte, NC', 'Cincinatti, OH', 'Wilson, NC'],
  Value: [],
  Property: [],
  Product: 
    ['Bacon', 'Ham', 'Ribs', 'Ground Pork', 'Shoulder', 'Loin', 'Sausage', 'Sausage, Smoked'],
}
