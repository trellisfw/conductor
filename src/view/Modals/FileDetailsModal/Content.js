import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import _ from 'lodash'
import moment from 'moment'
import ReactJson from 'react-json-view'

function Content(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.FileDetailsModal;
  const myState = state.view.Modals.FileDetailsModal;

  var jsonData = null;
  var jsonTitle = '';
  if (_.isEmpty(myState.audit) == false) {
    jsonData = _.get(myState, 'audit');
    jsonTitle = 'audit';
  } else if (_.isEmpty(myState.coi) == false) {
    jsonData = _.get(myState, 'coi');
    jsonTitle = 'coi';
  }
  jsonData = _.cloneDeep(jsonData);
  if (jsonData._id) delete jsonData._id;
  if (jsonData._rev) delete jsonData._rev;
  if (jsonData._type) delete jsonData._type;
  if (jsonData._meta) delete jsonData._meta;

  let validity = null;
  if (jsonData.certificate_validity_period && jsonData.certificate_validity_period.start && jsonData.certificate_validity_period.end) {
    validity = {
      start: moment(jsonData.certificate_validity_period.start, 'M/D/YYYY'),
      end: moment(jsonData.certificate_validity_period.end, 'M/D/YYYY'),
    }
    if (!validity.start || !validity.start.isValid()) validity = null;
    if (!validity.end || !validity.end.isValid()) validity = null;
    const now = moment();
    // If it starts after today, or ended before today, it's expired
    validity.expired = validity.start.isAfter(now) || validity.end.isBefore(now);
  }
  // audit (organization) or coi (holder)
  const org = (jsonData.organization && jsonData.organization.name) || null;
  const holder = (jsonData.holder && jsonData.holder.name) || null;
  let policies = jsonData.policies || null; // COI has policies
  // Filter policies whose dates we can't parse
  policies = policies && _.filter(policies, p => {
    p.start = moment(p.effective_date);
    p.end = moment(p.expire_date);
    if (!p.start.isValid())  return false;
    if (!p.end.isValid()) return false;
    const now = moment();
    p.expired = p.start.isAfter(now) || p.end.isBefore(now);
    return true; // keep this one in the list
  })
  const rowstyle1 = { backgroundColor: '#FFFFFF' };
  const rowstyle2 = { backgroundColor: '#EEEEEE' };
  const labelstyle = { fontWeight: 'bold', padding: '15px' };
  const contentstyle = { padding: '15px' };
  return (
    <div>
      <table style={{fontSize: '1.2em' }}>
        <tbody>{/* Row 1: Organization or Holder */}
          { !(org) ? '' : 
            <tr style={rowstyle1}>
              <td align="right" style={labelstyle}>Organization:</td>
              <td style={contentstyle}>{org}</td>
            </tr>
          }
          { !(holder) ? '' : 
            <tr style={rowstyle1}>
              <td align="right" style={labelstyle}>Holder:</td>
              <td style={contentstyle}>{holder}</td>
            </tr>
          }

          {/* Row 2: Score or Policies */}
          { !(jsonData.score && jsonData.score.final) ? '' : 
            <tr style={rowstyle2}>
              <td align="right" style={labelstyle}>Score:</td>
              <td style={contentstyle}>
                {jsonData.score.final.value} 
                &nbsp;
                {!jsonData.score.rating ? '' : 
                  <span style={{color: jsonData.score.rating.match(/(good|excellent)/i) ? 'green' : 'red'}}>
                    ({jsonData.score.rating.trim()})
                  </span>
                }
              </td>
            </tr>
          }
          { !(policies) ? '' : 
            <tr style={rowstyle2}>
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

          {/* Row 3: Scope or nothing */}
          { !(jsonData.scope && jsonData.scope.products_observed) ? '' : 
            <tr style={rowstyle1}>
              <td align="right" style={labelstyle}>Scope (Products):</td>
              <td style={contentstyle}>
                { _.map(jsonData.scope.products_observed, (p,idx) => 
                  <span key={'product'+idx} style={{border: "solid #AAAAAA 1px", borderRadius: '3px', paddingLeft: '3px', paddingRight: '3px', marginLeft: '3px', marginRight: '3px' }}>
                    {p.name}
                  </span>)
                }
              </td>
            </tr>
          }

          {/* Row 4: Validity (for audit) or nothing */}
          { !(validity) ? '' : 
            <tr style={rowstyle2}>
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
      { !myState.showData ? '' :
        (jsonData == null ? 
          <span>&lt; No Data &gt;</span> :
          <ReactJson src={jsonData} name={jsonTitle} 
            collapsed={1} collapseStringsAfterLength={50} 
            displayDataTypes={false} displayObjectSize={false} 
            enableClipboard={false} 
          />
        )
      }

      <div css={{
          color: '#2439FF',
          fontSize: 16,
          marginBottom: 7,
          display: 'flex',
          justifyContent: 'center'
        }}>
        <div css={{cursor: 'pointer'}} onClick={()=>myActions.viewPDF(_.get(myState, 'documentKey'))}>{'VIEW PDF'}</div>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <div css={{cursor: 'pointer'}} onClick={()=>myActions.toggleShowData(_.get(myState, 'documentKey'))}>{'VIEW DATA'}</div>
      </div>

    </div>
  )
}

export default Content
