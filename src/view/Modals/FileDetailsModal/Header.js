import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Header } from 'semantic-ui-react'
import overmind from '../../../overmind'
import _ from 'lodash'

function MyHeader(props) {
  const { state } = overmind();
  const myState = state.view.Modals.FileDetailsModal;
  if (myState.audit != null) {
    return (
      <Header>{_.get(myState, 'audit.organization.name')}</Header>
    );
  } else if (myState.coi != null) {
    return (
      <Header>{_.get(myState, 'coi.producer.name')}</Header>
    );
  } else {
    return (
      <Header>{'Unknown File'}</Header>
    );
  }
}

export default MyHeader
