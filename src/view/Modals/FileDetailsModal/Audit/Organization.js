import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table } from 'semantic-ui-react'

function Organization (props) {
  const { audit } = props
  const org = (audit.organization && audit.organization.name) ? audit.organization.name : 'Unknown';
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Organization
      </Table.Cell>
      <Table.Cell>{org}</Table.Cell>
    </Table.Row>
  )
}

export default Organization
