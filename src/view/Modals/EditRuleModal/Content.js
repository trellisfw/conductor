import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import _ from 'lodash'
import moment from 'moment'
import ReactJson from 'react-json-view'
//import Table from './Table';

function Content (props) {
  const { actions, state } = overmind()
  const myActions = actions.view.Modals.EditRuleModal
  const myState = state.view.Modals.EditRuleModal;
  const selected = state.view.Pages.Rules.selectedRule;
  const rule = state.view.Pages.Rules.rules[selected];
  let pattern = /(input[0-9]+)/g;

  return (
    <div
      css={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div css={{flexDirection: 'row'}}>
        <p>
          {rule.text.split(pattern).map((item, j) => 
            pattern.test(item) ? 
              <b key={`editrule-boldword-${j}`}>{rule[item]}</b> 
              : 
              item
            )
          }
        </p>
      </div>
      <span>{`${rule.total} Total Documents Processed`}</span>
      <span>{`Created ${rule.created} by ${rule.createdBy}`}</span>
    </div>
  )
}

export default Content
