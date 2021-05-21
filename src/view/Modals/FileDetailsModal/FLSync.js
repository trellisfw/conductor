import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import moment from 'moment'
import _ from 'lodash'
import { Button, Header, Icon} from 'semantic-ui-react'

function FLSync() {
  const { actions, state } = overmind();
  const myState = state.view.Modals.FileDetailsModal;
  const myActions = actions.view.Modals.FileDetailsModal;

  let valid = _.get(myState, ['document', '_meta', 'services', 'fl-sync', 'valid', 'status'])
  valid = valid === true ? 'PDF data validated against user-entered data. Ready for approval.' 
    : valid === false ? 'Rejected' : 'Awaiting validation'

  return (
    <div>
      <Header as="h4">Food Logiq</Header>
      <div>{valid}</div>
      {/*valid ? 
        <Button icon onClick={myActions.approveFLDocument}>
          <Icon name='signup' />
          <span css={{marginLeft: 7, marginRight: 4, color: '#0061C0', fontWeight: 100}}>Approve Pending Document</span>
        </Button > 
        : null*/ }
    </div>
  );
}

export default FLSync;
