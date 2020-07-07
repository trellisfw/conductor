import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table } from 'semantic-ui-react'
import _ from 'lodash';

function Sellers (props) {
  const { letterOfGuarantee } = props
  const sellers = _.chain(letterOfGuarantee).get('sellers').map('name').join(', ').value()
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Sellers
      </Table.Cell>
      <Table.Cell>{sellers}</Table.Cell>
    </Table.Row>
  )
}

export default Sellers
