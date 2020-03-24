import utils from '../utils'

export default {
  products: utils.objFromStrArr(
    ['Bacon', 'Ham', 'Ribs', 'Ground Pork', 'Shoulder', 'Loin', 'Sausage', 'Sausage, Smoked']
  ),
  documents: utils.objFromStrArr(
    ['Audit', 'Certificate of Insurance', 'Advance Shipping Notice']
  ),
  partners: {
    [`McDonald\'s`]: {
      email: 'McDonalds <aca+McDonalds@centricity.us>',
    },
    Tyson: {
      locations: utils.objFromObjArr([
        {
          text: 'Smithfield Packaged Meats Corp. - Wilson, NC',
          id: '10151',
          name: 'Wilson, NC'
        }, {
          text: 'Smithfield Packaged Meats Corp. - Arnold',
          id: '10138',
          name: 'Arnold, PA',
        }, {
          text: 'Smithfield Fresh Meats Corp. (North) - Smithfield, VA',
          id: '10132',
          name: 'North',
        }, {
          text: 'Smithfield Packaged Meats Corp. - Martin City',
          name: 'Martin City'
        }
      ]),
    },
    Wakefern: {
      userid: 'users/123',
    }
  }
}
