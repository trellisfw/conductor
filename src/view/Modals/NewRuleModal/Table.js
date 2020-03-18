import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import 'react-virtualized/styles.css'
import { Column, Table as RTable, AutoSizer } from 'react-virtualized'
import overmind from '../../../overmind'
import _ from 'lodash'
import moment from 'moment'
import classnames from 'classnames'

function Table () {
  const { actions, state } = overmind()
  const myActions = actions.view.Pages.Data.Table
  
   return (
    <AutoSizer>
      {({ height, width }) => (
        <RTable
          css={css`
            & .ReactVirtualized__Table__headerRow.odd {
              background: rgb(0, 106, 211);
              background: linear-gradient(
                180deg,
                rgba(0, 106, 211, 1) 0%,
                rgba(0, 84, 166, 1) 100%
              );
            }
            & .header > span {
              color: #fff;
              text-transform: none;
            }
            & .row {
              cursor: pointer;
            }
            & .odd {
              background-color: #efefef;
            }
            & .row:hover {
              background-color: #9accfd;
            }
            & .row .signature {
              display: flex;
              flex: 1;
              justify-content: flex-end;
            }
            & .row.unshared {
              font-weight: bold;
            }
          `}
          headerClassName={'header'}
          headerHeight={40}
          height={height}
          rowCount={collection.length}
          rowGetter={({ index }) => collection[index]}
          rowClassName={({ index }) => {
            var className = null
            if (index % 2 === 0) {
              className = 'row even'
            } else {
              className = 'row odd'
            }
            if (collection[index] && !collection[index].shared)
              className = classnames(className, 'unshared')
            return className
          }}
          rowHeight={30}
          width={width}
          onRowClick={myActions.onRowClick}
        >
          <Column label='Document' dataKey='filename' width={200} />
          <Column width={140} label='Processed' dataKey='createdAt' />
        </RTable>
      )}
    </AutoSizer>
  )
}

export default Table
