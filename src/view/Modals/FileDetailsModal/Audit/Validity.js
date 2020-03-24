import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table } from 'semantic-ui-react'
import moment from 'moment';

function Validity (props) {
  const { audit } = props
  let validity = null
  if (
    audit.certificate_validity_period &&
    audit.certificate_validity_period.start &&
    audit.certificate_validity_period.end
  ) {
    validity = {
      start: moment(audit.certificate_validity_period.start, 'M/D/YYYY'),
      end: moment(audit.certificate_validity_period.end, 'M/D/YYYY')
    }
    if (!validity.start || !validity.start.isValid()) validity = null
    if (!validity.end || !validity.end.isValid()) validity = null
    const now = moment()
    // If it starts after today, or ended before today, it's expired
    validity.expired = validity.start.isAfter(now) || validity.end.isBefore(now)
  }
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Validity
      </Table.Cell>
      <Table.Cell>
      {
        (!validity) ? '' :
        (validity.expired) ?
          <span style={{ color: 'red' }}>EXPIRED!</span>
        :
          <span style={{ color: 'green' }}>
            {`VALID (from ${validity.start.format('MMM d, YYYY')} to ${validity.end.format('MMM d, YYYY')})`}
          </span>
      }</Table.Cell>
    </Table.Row>
  )
}

export default Validity
