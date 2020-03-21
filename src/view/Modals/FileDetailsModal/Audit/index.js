import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Table } from 'semantic-ui-react'

import Organization from './Organization'
import Scope from './Scope'
import Score from './Score'
import Validity from './Validity'
import Unmask from './Unmask'
import Masks from './Masks'

function Audit (props) {
  const { audit, document } = props
  return (
    <Table celled striped>
      <Table.Body css={{fontSize: 16}}>
        <Organization audit={audit} />
        <Score audit={audit} />
        <Scope audit={audit} />
        <Validity audit={audit} />
        <Unmask document={document} />
        <Masks document={document} />
      </Table.Body>
    </Table>
  )
}

export default Audit
