import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Header } from 'semantic-ui-react'
import overmind from '../../../overmind'
import _ from 'lodash'

function MyHeader (props) {
  const { state } = overmind()
  const myState = state.view.Modals.FileDetailsModal
  let title = 'Unknown Document Type';
  if (myState.audit != null && _.keys(myState.audit).length > 0) {
    title = `FSQA Audit`;
  } else if (myState.coi != null && _.keys(myState.coi).length > 0) {
    title = `Certificate of Insurance`;
  }
  return (
    <Header>
      <div css={{display: 'flex', justifyContent: 'space-between'}}>
        <div>{title}</div>
        <div css={{color: 'red', fontWeight: 'bold'}}>
          {
            (myState.document && myState.document.unmask) ? 'MASKED' : null
          }
        </div>
      </div>
    </Header>
  )
}

export default MyHeader
