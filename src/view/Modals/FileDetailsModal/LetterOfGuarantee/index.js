import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Table } from 'semantic-ui-react'

import Buyers from './Buyers'
import Sellers from './Sellers'

function letterOfGuarantee (props) {
  const { letterOfGuarantee } = props
  return (
    <Table celled striped>
      <Table.Body css={{fontSize: 16}}>
        <Buyers letterOfGuarantee={letterOfGuarantee} />
        <Sellers letterOfGuarantee={letterOfGuarantee} />
      </Table.Body>
    </Table>
  )
}

export default letterOfGuarantee
