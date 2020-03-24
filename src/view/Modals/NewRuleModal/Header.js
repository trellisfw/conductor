import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Button, Header, Icon } from 'semantic-ui-react'
import overmind from '../../../overmind'
import _ from 'lodash'

function MyHeader (props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.NewRuleModal;
  let myActions = actions.view.Modals.NewRuleModal;
  return (
    <Header style={{display:'flex'}}>
    {myState.page === 'Edit' && !myState.Edit.edit ? <Button 
        icon
        primary
        onClick={evt => {myActions.backClicked()}}>
      <Icon name='arrow left'/>
    </Button>
      : undefined
    }
    <span style={{flex:1}}>{`${myState.Edit.edit ? "Edit" : "New"} Rule`}</span>
    <Button 
        icon
        primary
        onClick={evt => {myActions.cancelClicked()}}>
      <Icon name='x'/>
    </Button>
    </Header>
  )
}

export default MyHeader
