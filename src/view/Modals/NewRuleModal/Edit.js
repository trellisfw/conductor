import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import moment from 'moment'
import ReactJson from 'react-json-view'
import Autocomplete from '@material-ui/lab/Autocomplete'
import TextField from '@material-ui/core/TextField'
import { Button } from 'semantic-ui-react'

function Blank (props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.NewRuleModal;
  let myActions = actions.view.Modals.NewRuleModal;
  let rule = myState.Edit.rule;
  let lists = myState.List;

  return (
    <Autocomplete
      style={{
        fontFamily: 'bold',
        width: 'fit-content',
      }}
      options={lists.rules[rule[props.item]].enum}
      autoHighlight
      value={rule[props.item]}
      onChange={(evt) => {
        myActions.textChanged(props.index,props.item, evt)
      }}
      renderInput={params => (
        <TextField {...params} style={{width:'fit-content'}}/>
      )}
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
