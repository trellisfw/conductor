/* Copyright 2020 Qlever LLC
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import config from './config'

const FL_BUSINESS_ID = config.get('fl_business_id')

// TODO: How to handle the concept of shares long-term? Another μservice?
interface BaseShare {
  type: string
  location?: string
  id?: string
  auto?: boolean
  with: string
  products?: string[]
}
// Set of share destinations
interface EmailShare extends BaseShare {
  type: 'email'
  to: string // email address
}
interface FLShare extends BaseShare {
  type: 'fl'
  // Format taken from @n-give
  shares: { [index: string]: { communities: string[] } }
}
interface TrellisShare extends BaseShare {
  type: 'shareWf' // 'trellis', // TODO: Make not wf specific
}
export type Share = EmailShare | FLShare | TrellisShare

// Demo locations?
const shares: Share[] = [
  {
    type: 'email',
    products: ['Bacon', 'bacon'], // TODO: Case insenitive
    with: 'McDonalds',
    to: 'McDonalds <aca+McDonalds@centricity.us>'
  },
  {
    type: 'fl',
    location: 'Smithfield Packaged Meats Corp. - Wilson, NC',
    id: '10151',
    auto: false,
    with: 'Tyson',
    shares: {
      [FL_BUSINESS_ID]: {
        communities: []
      }
    }
  },
  {
    type: 'fl',
    location: 'Smithfield Fresh Meats Corp. (North) - Smithfield, VA',
    id: '10132',
    with: 'Tyson',
    shares: {
      [FL_BUSINESS_ID]: {
        communities: []
      }
    }
  },
  {
    type: 'fl',
    location: 'Smithfield Packaged Meats Corp. - Arnold',
    id: '10138',
    with: 'Tyson',
    shares: {
      [FL_BUSINESS_ID]: {
        communities: []
      }
    }
  },
  {
    type: 'shareWf', // 'trellis', // TODO: Make not wf specific
    location: 'Smithfield Packaged Meats Corp. - Martin City',
    id: '',
    with: 'Wakefern'
  }
]

export default shares
