import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table } from 'semantic-ui-react'

function Holder (props) {
  const { coi } = props
  const holder = (coi.holder && coi.holder.name) ? coi.holder.name : 'Unknown';
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Holder
      </Table.Cell>
      <Table.Cell>{holder}</Table.Cell>
    </Table.Row>
  )
}

export default Holder
