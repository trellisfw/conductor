import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Modal } from 'semantic-ui-react'
import overmind from '../../../overmind'

import Header from './Header';
import Content from './Content';

function EditRuleModal(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.EditRuleModal;
  const myState = state.view.Modals.EditRuleModal;
  return (
    <Modal open={myState.open} onClose={myActions.close}>
      <Header />
      <Modal.Content >
        <div css={{minHeight: 350, display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
          <Content />
        </div>
      </Modal.Content>
    </Modal>
  );
}

export default EditRuleModal;
