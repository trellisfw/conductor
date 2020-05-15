import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Table } from 'semantic-ui-react'

import Organization from './Organization'
import Scope from './Scope'
import Score from './Score'
import Validity from './Validity'

function Audit (props) {
  const { audit } = props
  return (
    <Table celled striped>
      <Table.Body css={{fontSize: 16}}>
        <Organization audit={audit} />
        <Score audit={audit} />
        <Scope audit={audit} />
        <Validity audit={audit} />
      </Table.Body>
    </Table>
  )
}

export default Audit
