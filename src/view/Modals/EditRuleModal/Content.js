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
  const selectedRule = state.view.Pages.Rules.rules[selected];

  return (
    <div
      css={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div css={{flexDirection: 'row'}}>
        {selectedRule.text[0].map((t, i) => 
          <span key={'editrule'+i}>{t+' '}<b>{selectedRule.text[1][i]+' '}</b></span>
        )}
      </div>
      <span>{`${selectedRule.total} Total Documents Processed`}</span>
      <span>{`Created ${selectedRule.created} by ${selectedRule.createdBy}`}</span>
    </div>
  )
}

export default Content
