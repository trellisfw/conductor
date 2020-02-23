import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import _ from 'lodash'
import moment from 'moment'

function Audit(props) {
  const { audit } = props;

  let validity = null;
  if (audit.certificate_validity_period && audit.certificate_validity_period.start && audit.certificate_validity_period.end) {
    validity = {
      start: moment(audit.certificate_validity_period.start, 'M/D/YYYY'),
      end: moment(audit.certificate_validity_period.end, 'M/D/YYYY'),
    }
    if (!validity.start || !validity.start.isValid()) validity = null;
    if (!validity.end || !validity.end.isValid()) validity = null;
    const now = moment();
    // If it starts after today, or ended before today, it's expired
    validity.expired = validity.start.isAfter(now) || validity.end.isBefore(now);
  }
  const org = audit.organization || null;

  const r = 0; // track which row we're on
  const rowstyles = [ 
    { backgroundColor: '#FFFFFF' }, // even rows
    { backgroundColor: '#EEEEEE' }, // odd rows
  ];
  const labelstyle = { fontWeight: 'bold', padding: '15px' };
  const contentstyle = { padding: '15px' };
  return (
    <table style={{fontSize: '1.2em' }}>
      <tbody>
        {/* Row 1: Organization or Holder */}
        { !(org) ? '' : 
          <tr style={rowstyles[r++%2]}>
            <td align="right" style={labelstyle}>Organization:</td>
            <td style={contentstyle}>{org}</td>
          </tr>
        }

        {/* Row 2: Score */}
        { !(audit.score && audit.score.final) ? '' : 
          <tr style={rowstyles[r++%2]}>
            <td align="right" style={labelstyle}>Score:</td>
            <td style={contentstyle}>
              {audit.score.final.value} 
              &nbsp;
              {!audit.score.rating ? '' : 
                <span style={{color: audit.score.rating.match(/(good|excellent)/i) ? 'green' : 'red'}}>
                  ({audit.score.rating.trim()})
                </span>
              }
            </td>
          </tr>
        }

        {/* Row 3: Scope */}
        { !(audit.scope && audit.scope.products_observed) ? '' : 
          <tr style={rowstyles[r++%2]}>
            <td align="right" style={labelstyle}>Scope (Products):</td>
            <td style={contentstyle}>
              { _.map(audit.scope.products_observed, (p,idx) => 
                <span key={'product'+idx} style={{border: "solid #AAAAAA 1px", borderRadius: '3px', paddingLeft: '3px', paddingRight: '3px', marginLeft: '3px', marginRight: '3px' }}>
                  {p.name}
                </span>)
              }
            </td>
          </tr>
        }

        {/* Row 4: Validity */}
        { !(validity) ? '' : 
          <tr style={rowstyles[r++%2]}>
            <td align="right" style={labelstyle}>Validity:</td>
            <td style={contentstyle}>
              { validity.expired ? 
                <span style={{color: 'red'}}>EXPIRED!</span> :
                <span style={{color: 'green'}}>VALID</span>
              }
              &nbsp;(from {validity.start.format('MMM d, YYYY')} to {validity.end.format('MMM d, YYYY')})
            </td>
          </tr>
        }

      </tbody>
    </table>
  )
}

export default Audit
