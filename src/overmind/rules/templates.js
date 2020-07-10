import config from './config'
const FL_BUSINESS_ID = config.get('fl_business_id')

export default {
  tempA: {
    text: "When a Certificate of Insurance has an identifield holder, share it with the associated trading partners.",
    share: {
      template: 'tempA',
      type: 'trellis',
//      locations: 'input0',
//      products: 'input1',
//      partners: 'input2',
//      mask: 'input3',
//      shares: {
//        [FL_BUSINESS_ID]: {
//          communities: []
//        }
//      }
    }
  },
  tempB: {
    text: "When a FSQA Audit has an identifield facility location, share it with the associated trading partners.",
    share: {
      template: 'tempB',
      type: 'trellis',
    }
  },
  tempC: {
    text: "When a FSQA Certificate has an identifield facility location, share it with the associated trading partners.",
    share: {
      template: 'tempC',
      type: 'trellis',
    }
  },
  tempD: {
    text: "When a Letter of Guarantee has an identifield vendor, share it with the associated trading partners.",
    share: {
      template: 'tempD',
      type: 'trellis',
    }
  },
  temp0: {
    id: 'temp0',
    icons: ['foodlogiq.svg'],
    text: "When an audit has a location of input0 and a product of input1, sync it to input2 via Food LogiQ.",
    input0: {
      text: 'this location',
      type: 'locations',
      values: {},
    },
    input1: {
      text: 'this product',
      type: 'products',
      values: {},
    },
    input2: {
      text: 'this partner',
      type: 'partners',
      values: {},
    },
    input3: {
      text: 'masked/unmasked',
      type: 'mask',
      values: {},
    },
    categories: ['FSQA', 'PII'],
    share: {
      template: 'temp0',
      type: 'fl',
      locations: 'input0',
      products: 'input1',
      partners: 'input2',
      mask: 'input3',
      shares: {
        [FL_BUSINESS_ID]: {
          communities: []
        }
      }
    }
  },
  temp1: {
    id: 'temp1',
    icons: ['ift.svg'],
    text: "When an audit has a location of input0 and a product of input1, sync the input3 copy to IBM Food Trust.",
    input0: {
      text: 'this location',
      type: 'locations',
      values: {},
    },
    input1: {
      text: 'this product',
      type: 'products',
      values: {},
    },
    input3: {
      text: 'masked/unmasked',
      type: 'mask',
      values: {},
    },
    categories: ['FSQA', 'PII'],
    share: {
      template: 'temp1',
      type: 'ift',
      locations: 'input0',
      products: 'input1',
      mask: 'input3'
    }
  },
  temp2: {
    id: 'temp2',
    icons: ['email.svg'],
    text: "When an audit has a location of input0 and a product of input1, email it to input2.",
    input0: {
      text: 'this location',
      type: 'locations',
      values: {},
    },
    input1: {
      text: 'this product',
      type: 'products',
      values: {},
    },
    input2: {
      text: 'this email',
      type: 'emails',
      values: {},
    },
    categories: ['FSQA', 'PII'],
    share: {
      template: 'temp2',
      type: 'email',
      locations: 'input0',
      products: 'input1',
      emails: 'input2',
    }
  },
}
