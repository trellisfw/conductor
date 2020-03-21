import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table } from 'semantic-ui-react'
import _ from 'lodash'
import moment from 'moment';
import Chip from '@material-ui/core/Chip'
import { Popup } from 'semantic-ui-react'

function Scope (props) {
  const { coi } = props
  let policies = _.cloneDeep(coi.policies) || []; // COI has policies
  // Filter policies whose dates we can't parse
  policies = _.filter(policies, p => {
    p.start = moment(p.effective_date);
    p.end = moment(p.expire_date);
    if (!p.start.isValid())  return false;
    if (!p.end.isValid()) return false;
    const now = moment();
    p.expired = p.start.isAfter(now) || p.end.isBefore(now);
    return true; // keep this one in the list
  });
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Policies
      </Table.Cell>
      <Table.Cell css={css`
          .MuiChip-root {
            font-family: inherit;
            font-size: 14px;
            line-height: 16px;
            margin-left: 3px;
            margin-top: 3px;
          }
          .MuiChip-root:first-of-type {
            margin-left: 0px;
          }
        `}>
        {
          _.map(policies, (p, idx) => (
            <Popup key={idx} content={
              <div>
                <div css={{textAlign: 'center'}}>{'Effective'}</div>
                <div>{`${p.start.format('MMMM d, YYYY')} to ${p.end.format('MMMM d, YYYY')}`}</div>
              </div>
            } trigger={
              <Chip color={(p.expired) ? 'secondary' : 'default'} label={`${p.number}${p.expired ? ': EXPIRED' : ''}`} />
            } />
          ))
        }
      </Table.Cell>
    </Table.Row>
  )
}

export default Scope
