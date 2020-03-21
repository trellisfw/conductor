import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table } from 'semantic-ui-react'
import _ from 'lodash'
import Chip from '@material-ui/core/Chip'

function Scope (props) {
  const { audit } = props
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Scope (Products)
      </Table.Cell>
      <Table.Cell css={css`
          .MuiChip-root {
            font-family: inherit;
            font-size: 14px;
            line-height: 16px;
            margin-left: 3px;
            margin-top: 3px;
          }
          .MuiChip-root:first-of-type {
            margin-left: 0px;
          }
        `}>
        {
          _.map(audit.scope.products_observed, (p, idx) => (
            <Chip key={idx} label={p.name} />
          ))
        }
      </Table.Cell>
    </Table.Row>
  )
}

export default Scope
