import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Table } from 'semantic-ui-react'

import Organization from './Organization'

function Certificate (props) {
  const { certificate } = props
  return (
    <Table celled striped>
      <Table.Body css={{fontSize: 16}}>
        <Organization certificate={certificate} />
      </Table.Body>
    </Table>
  )
}

export default Certificate
