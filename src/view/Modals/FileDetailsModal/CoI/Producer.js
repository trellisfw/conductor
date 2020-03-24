import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table } from 'semantic-ui-react'

function Producer (props) {
  const { coi } = props
  const producer = (coi.producer && coi.producer.name) ? coi.producer.name : 'Unknown';
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Producer
      </Table.Cell>
      <Table.Cell>{producer}</Table.Cell>
    </Table.Row>
  )
}

export default Producer
