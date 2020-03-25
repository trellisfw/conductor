import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Button, Header } from 'semantic-ui-react'
import overmind from '../../../overmind'
import _ from 'lodash'

function MyHeader (props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.NewRuleModal;
  let myActions = actions.view.Modals.NewRuleModal;
  let isEditing = myState.Edit.edit;
  //TODO deleteClicked()
  return (
    <Header>
      <div css={{display: 'flex', justifyContent: 'space-between'}}>
        <div css={{display: 'flex', alignItems: 'center'}}>
          <div css={{fontSize: 24}}>{isEditing ? 'Edit Rule' : 'New Rule'}</div>
        </div>
        <div>
          <Button icon='x'
            style={{padding: '.78571429em .78571429em .78571429em'}}
            onClick={evt => {myActions.cancelClicked()}}  />
        </div>
      </div>
    </Header>
  )
}

export default MyHeader
