import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table } from 'semantic-ui-react'
import _ from 'lodash';

function Buyers (props) {
  const { letterOfGuarantee } = props
  const buyers = _.chain(letterOfGuarantee).get('buyers').map('name').join(', ').value()
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Buyers
      </Table.Cell>
      <Table.Cell>{buyers}</Table.Cell>
    </Table.Row>
  )
}

export default Buyers
