import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table } from 'semantic-ui-react'

function Score (props) {
  const { audit } = props
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Score
      </Table.Cell>
      <Table.Cell>
      {
        `${audit.score.final.value} `
      }
      {!audit.score.rating ? (
        ''
      ) : (
        <span
          style={{
            color: audit.score.rating.match(/(good|excellent)/i)
              ? 'green'
              : 'red'
          }}
        >
          ({audit.score.rating.trim()})
        </span>
      )}
      </Table.Cell>
    </Table.Row>
  )
}

export default Score
