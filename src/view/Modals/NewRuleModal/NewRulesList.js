import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import _ from 'lodash'

function NewRulesList(props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.NewRuleModal.List;
  let myActions = actions.view.Modals.NewRuleModal;
  let newRules = myState.rules.rules;
  let pattern = /(input[0-9]+)/g;

  return (
    <div
      css={css`
        display: flex;
        flex: 1;
        justify-content: space-between;
        flex-wrap: wrap;
      `}
    >
    {newRules.map((r, j) => 
        <div
          onClick={(evt) => {myActions.newRuleSelected(r)}}
          key={'newrulecard'+j}
          css={css`
            display: flex;
            border: 1px solid #000000;
            border-radius: 5px;
            box-shadow: 2px 2px 2px #555555;
            margin: 5px;
            padding: 5px;
          `}>
        <p>
          {r.text.split(pattern).map((item, j) => 
            pattern.test(item) ? 
              <b key={`newrule-${j}-boldword-${j}`}>{r[item]}</b> 
              : 
              item
            )
          }
        </p>
      </div>
      )}
    </div>
  )
}

export default NewRulesList;
