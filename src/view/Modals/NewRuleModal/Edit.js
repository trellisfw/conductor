import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import moment from 'moment'
import ReactJson from 'react-json-view'
import TextField from '@material-ui/core/TextField'
import Chip from '@material-ui/core/Chip'
import { Button } from 'semantic-ui-react'
import { Dropdown } from 'semantic-ui-react'

function Blank (props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.NewRuleModal;
  let myActions = actions.view.Modals.NewRuleModal;
  let rule = myState.Edit.rule;
  let template = myState.Edit.template;
  let list = state.rules[template[props.item].type];
  console.log('ITEM IS', props.item, 'VALUE IS', rule[props.item].values);

  return (
    <Dropdown
      fluid
      search
      selection
      multiple
      style={{
        fontFamily: 'bold',
        width: 'fit-content',
      }}
      options={list.map(i => ({key: i, text: i, value:i}))}
      value={rule[props.item].values}
      placeholder={`E.g., ${list[0]}`}
      onChange={(evt, data) => {
        myActions.textChanged({values: data.value, key:props.item})
      }}
    /> 
  )
}

function Edit (props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.NewRuleModal.Edit;
  let myActions = actions.view.Modals.NewRuleModal;
  let rule = myState.rule;
  let pattern = /(input[0-9]+)/g;

  return (
    <div
      css= {{
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
      }}>
      <div
        css={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {rule.text.split(pattern).map((item, j) => 
          pattern.test(item) ? 
            <Blank key={'edit-new-rule-'+j} item={item} index={j}/>
            : 
            item
          )
        }
      </div>
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
        }}>
        <Button onClick={(evt) => {myActions.cancelClicked()}}>Cancel</Button>
        <Button onClick={(evt) => {myActions.doneClicked()}}>Done</Button>
      </div>
    </div>
  )
}

export default Edit
