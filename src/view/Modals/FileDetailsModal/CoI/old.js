import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import _ from 'lodash'
import moment from 'moment'

function CoI(props) {
  const { coi } = props;

  const holder = (coi.holder && coi.holder.name) || null;
  let policies = coi.policies || null; // COI has policies
  // Filter policies whose dates we can't parse
  policies = policies && _.filter(policies, p => {
    p.start = moment(p.effective_date);
    p.end = moment(p.expire_date);
    if (!p.start.isValid())  return false;
    if (!p.end.isValid()) return false;
    const now = moment();
    p.expired = p.start.isAfter(now) || p.end.isBefore(now);
    return true; // keep this one in the list
  });
  let r = 0; // keep track of which row we're on
  const rowstyles = [
    { backgroundColor: '#FFFFFF' }, // even rows
    { backgroundColor: '#EEEEEE' }, // odd rows
  ];
  const labelstyle = { fontWeight: 'bold', padding: '15px' };
  const contentstyle = { padding: '15px' };
  return (
    <table style={{fontSize: '1.2em' }}>
      <tbody>{/* Row 1: Holder */}
        { !(holder) ? '' : 
          <tr style={rowstyles[r++%2]}>
            <td align="right" style={labelstyle}>Holder:</td>
            <td style={contentstyle}>{holder}</td>
          </tr>
        }

        {/* Row 2: Policies */}
        { !(policies) ? '' : 
          <tr style={rowstyles[r++%2]}>
            <td align="right" style={labelstyle}>Policies:</td>
            <td style={contentstyle}>
              <table><tbody>
                { _.map(policies, (p,idx) => 
                    <tr key={'policy'+idx} style={{color: p.expired ? 'red' : 'green' }}>
                      <td align="right">{p.number}:</td>
                      <td>
                        {p.expired ? 'EXPIRED!' : 'VALID'}
                        &nbsp;(from {p.start.format('MMM d, YYYY')} to {p.end.format('MMM d, YYYY')})
                      </td>
                    </tr>
                  )
                }
              </tbody></table>
            </td>
          </tr>
        }

      </tbody>
    </table>
  )
}

export default CoI
