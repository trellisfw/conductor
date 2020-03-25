/** @jsx jsx */
import {json} from 'overmind'
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import { Button } from 'semantic-ui-react'
import { Dropdown } from 'semantic-ui-react'
import _ from 'lodash';

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
        myActions.textChanged({values: data.value, key:props.item})
      }}
    />
  )
}

function BlankB (props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.NewRuleModal;
  let myActions = actions.view.Modals.NewRuleModal;
  let isEditing = myState.Edit.edit;
  let rule = myState.Edit.rule;
  let template = myState.Edit.template;
  let type = template[props.item].type;
  // TODO: make this cleaner
//  if (type === 'mask') return <MaskBlank key={'mask-blank'+props.index} item={props.item} index={props.index}/>
  let list = json(state.rules[type]);
  const placeholder = template[props.item].text;
  let selected = Object.values(rule[props.item].values).map(v => v.name).join(' or ');
  if (selected.length == 0) {
    if (isEditing) {
      selected = 'anything';
    } else {
      selected = placeholder;
    }
  }

  const trigger = (
    <span css={css`
      color: rgba(0, 0, 0, 0.4);
      &:hover {
        color: #000;
      }
      &::before {
        content: "";
        background: #000;
        position: absolute;
        left: 1px;
        right: 1px;
        bottom: 3px;
        height: 2px;
      }
    `}>
      &nbsp;{selected}&nbsp;
    </span>
  )
  return (
    <Dropdown trigger={trigger} icon={null} pointing='top left'>
      <Dropdown.Menu>
        {
          _.map(list, (i) => {
            return <Dropdown.Item onClick={()=>{
              myActions.textChanged({values: [i.key], key: props.item})
            }} key={i.key}>{i.name}</Dropdown.Item>
          })
        }
      </Dropdown.Menu>
    </Dropdown>
  )
}

function MaskBlank (props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.NewRuleModal;
  let myActions = actions.view.Modals.NewRuleModal;
  let isEditing = myState.Edit.edit;
  let rule = myState.Edit.rule;
  let template = myState.Edit.template;
  let type = template[props.item].type;
  let list = json(state.rules[type]);
  const placeholder = template[props.item].text;
  let selected = Object.values(rule[props.item].values).map(v => v.name).join(' or ');
  console.log('myState.page', myState.page)
  if (selected.length == 0) {
    if (isEditing) {
      selected = 'anything';
    } else {
      selected = placeholder;
    }
  }

  const trigger = (
    <span css={css`
      color: rgba(0, 0, 0, 0.4);
      &:hover {
        color: #000;
      }
      &::before {
        content: "";
        background: #000;
        position: absolute;
        left: 1px;
        right: 1px;
        bottom: -2px;
        height: 2px;
      }
    `}>
      &nbsp;{selected}&nbsp;
    </span>
  )
  return (
    <Dropdown trigger={trigger} icon={null} pointing='top left'>
      <Dropdown.Menu>{
          _.map([{name: 'masked', key:'masked'}, {name: 'unmasked', key: 'unmasked'}], (i) =>
            <Dropdown.Item onClick={()=>{
              myActions.textChanged({values: [i.key], key: props.item})
            }} key={i.key}>{i.name}</Dropdown.Item>
          )
        }
      </Dropdown.Menu>
    </Dropdown>
  )
}

function Edit (props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.NewRuleModal.Edit;
  let myActions = actions.view.Modals.NewRuleModal;
  let isEditing = myState.edit;
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
        <div css={css`
          text-align: center;
          font-size: 18px;
          line-height: 35px;
          & > span {
            display: contents;
          }
        `}>
          {
            rule.text.split(pattern).map((item, j) =>
            pattern.test(item) ?
              <BlankB key={'edit-new-rule-'+j} item={item} index={j}/>
              :
              <span key={'edit-new-rule-'+j}>{item}</span>
            )
          }
        </div>
      </div>
      <div
        css={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
        }}>
        <Button onClick={(evt) => {myActions.backClicked()}}>Back</Button>
        {
          (!isEditing) ? null :
          <Button style={{marginLeft: 7}} color='red' onClick={(evt) => {myActions.deleteClicked()}}>Delete</Button>
        }
        <Button style={{marginLeft: 7}} primary onClick={(evt) => {myActions.doneClicked()}}>
        {
          (isEditing) ? 'Save' : 'Add Rule'
        }
        </Button>
      </div>
    </div>
  )
}

export default Edit
