import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import 'react-virtualized/styles.css'
import { Column, Table as RTable, AutoSizer, InfiniteLoader } from 'react-virtualized'
import overmind from '../../../overmind'
import _ from 'lodash'
import moment from 'moment'
import UploadingIcon from './icons/UploadIcon'
import ProcessingIcon from './icons/ProcessingIcon'
import SignedIcon from './icons/SignedIcon'
import TargetIcon from './icons/TargetIcon'
import classnames from 'classnames'
import infiniteLoader from '../infiniteLoader'

function Table ({docType}) {
  const { actions, state } = overmind()
  const myActions = actions.view.Pages.COIS.Table
  const myState = state.view.Pages.COIS
  const collection = myState.Table || [];
  const il = infiniteLoader('COIS', myActions.loadDocumentKeys);
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
          rowGetter={({ index }) => {
            il.getRow(collection[index])
            return collection[index]
          }}
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
          <Column
            label=''
            dataKey='processingService'
            width={40}
            cellRenderer={({ rowData }) =>
              !rowData || rowData.processingService !== 'target' ? (
                ''
              ) : (
                <TargetIcon />
              )
            }
          />
          <Column label='Holder' dataKey='holder' width={400} />
          <Column label='Producer' dataKey='producer' width={300} />
          <Column label='Insured' dataKey='insured' width={300} />
          <Column width={200} label='Added' dataKey='createdAt' />
          <Column
            dataKey='name'
            className='signature'
            width={width - 600}
            cellRenderer={({ rowData }) => {
              if (!rowData.signed) return null
              return (
                <div css={{ display: 'flex', alignItems: 'center' }}>
                  <SignedIcon />
                  <div css={{ marginLeft: 3, color: '#02A12B', marginRight: 7 }}>
                    {'Signed'}
                  </div>
                </div>
              )
            }}
          />
        </RTable>
      )}
    </AutoSizer>
  )
}

export default Table
