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
  if (myState.docType == 'fsqa-audits') {
    title = `FSQA Audit`;
  } else if (myState.docType == 'cois') {
    title = `Certificate of Insurance`;
  } else if (myState.docType == 'fsqa-certificates') {
    title = `FSQA Certificate`;
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
