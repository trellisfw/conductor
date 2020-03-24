import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Table } from 'semantic-ui-react'

import Producer from './Producer'
import Holder from './Holder'
import Policies from './Policies'
import Unmask from '../common/Unmask'
import Masks from '../common//Masks'

function CoI (props) {
  const { coi, document } = props
  return (
    <Table celled striped>
      <Table.Body css={{fontSize: 16}}>
        <Producer coi={coi} />
        <Holder coi={coi} />
        <Policies coi={coi} />
        <Unmask document={document} />
        <Masks document={document} />
      </Table.Body>
    </Table>
  )
}

export default CoI
