import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Modal } from 'semantic-ui-react'
import overmind from '../../../overmind'

import Header from './Header';
import List from './List';
import Edit from './Edit';

function NewRuleModal(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.NewRuleModal;
  const myState = state.view.Modals.NewRuleModal;
  return (
    <Modal open={myState.open} onClose={myActions.close}>
      <Header />
      <Modal.Content >
        <div css={{minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
        {myState.page === 'List' ? <List /> : <Edit />}
        </div>
      </Modal.Content>
    </Modal>
  );
}

export default NewRuleModal;
