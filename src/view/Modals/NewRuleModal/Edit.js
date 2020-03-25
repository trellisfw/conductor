/** @jsx jsx */
import {json} from 'overmind'
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import { Button } from 'semantic-ui-react'
import { Dropdown } from 'semantic-ui-react'

function Blank (props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.NewRuleModal;
  let myActions = actions.view.Modals.NewRuleModal;
  let rule = myState.Edit.rule;
  let template = myState.Edit.template;
  let type = template[props.item].type;
  let list = json(state.rules[type]);
  let q = rule[props.item].searchQuery;
  if (q && !list[q.key]) list[q.key] = q;

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
      options={Object.values(list).map(i => ({key: i.key, text: i.name, value:i.key}))}
      value={Object.values(rule[props.item].values).map(v => v.key)}
      placeholder={`E.g., ${Object.values(list)[0].name}`}
      onChange={(evt, data) => {
        myActions.textChanged({values: data.value, key:props.item, data})
      }}
      onSearchChange={(evt, data) => {
        myActions.searchChanged({data, key:props.item, evt})
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
