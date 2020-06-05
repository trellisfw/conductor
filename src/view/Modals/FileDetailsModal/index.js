import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Modal } from 'semantic-ui-react'
import overmind from '../../../overmind'

import Header from './Header';
import Content from './Content';
import Sharing from './Sharing'

function FileDetailsModal(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.FileDetailsModal;
  const myState = state.view.Modals.FileDetailsModal;
  return (
    <Modal open={myState.open} onClose={myActions.close}>
      <Header />
      <Modal.Content >
        <div css={{minHeight: 350, display: 'flex', flexDirection: 'column'}}>
          <Content />
          <Sharing />
        </div>
      </Modal.Content>
    </Modal>
  );
}

export default FileDetailsModal
