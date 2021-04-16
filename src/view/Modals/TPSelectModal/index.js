import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import _ from 'lodash'

import { Button, Checkbox, Dropdown, Header, Modal } from 'semantic-ui-react'
import overmind from '../../../overmind'

function TPSelectModal(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.TPSelectModal;
  const myState = state.view.Modals.TPSelectModal;
  const tps = state.tps || {}
  const tp = myState.tp;
  let options = myState.options || Object.keys(tps).map(key => ({
    key,
    text: tps[key].name,
    value: key,
  })).filter(o => o.text)  
  options = _.sortBy(options, ['text'])
  console.log(options)

  return (
    <Modal open={myState.open} onClose={myActions.close}>
      <Modal.Content css={{
        display:'flex',
        flexDirection: 'column'
      }}>
        <Header>
          Log in as Trading Partner...  
        </Header>
        <Dropdown
          placeholder='Select trading partner'
          fluid
          search
          onChange={(evt, {value}) => {myActions.changeTP(value)}}
          onSearchChange={(evt, {searchQuery}) => {myActions.onSearchChange({props:searchQuery})}}
          text={tp}
          options={options}
        />
        <Checkbox
          checked={myState.pending}
          onClick={myActions.checkPending}
          label='View pending docs'
        />
        <Button
          onClick={myActions.done}
        >
          Done
        </Button>
      </Modal.Content>
    </Modal>
  );
}

export default TPSelectModal
