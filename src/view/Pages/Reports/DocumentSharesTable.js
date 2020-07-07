import React from 'react'

/** @jsx jsx */
import {jsx, css} from '@emotion/core'

import 'react-virtualized/styles.css'
import {Checkbox} from 'semantic-ui-react';
import {Column, Table as RTable, AutoSizer, InfiniteLoader} from 'react-virtualized'
import overmind from '../../../overmind'
import _ from 'lodash'
import moment from 'moment'
import classnames from 'classnames'
import infiniteLoader from '../infiniteLoader'

function DocumentSharesTable({docType}) {
  const {actions, state} = overmind();
  const myActions = actions.view.Pages.Reports.documentShares.Table;
  const myState = state.view.Pages.Reports.documentShares;
  const collection = myState.Table || [];

  const il = infiniteLoader('Document Shares', myActions.loadDocumentKeys);
  const now = moment();
  return (
    <AutoSizer>
      {({height, width}) => (
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
          rowGetter={({index}) => {
            il.getRow(collection[index])
            return collection[index]
          }}
          rowClassName={({index}) => {
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
          onRowClick={({rowData}) => myActions.toggleCheckbox(rowData.documentKey)}
        >

          <Column
            // label={<Checkbox
            //   checked={state.oada.data.Reports.allReportsSelected}
            // />}
            headerRenderer={(data) => {
              return (
                <Checkbox
                  checked={state.oada.data.Reports.allSelected}
                  onClick={actions.view.Pages.Reports.selectAllReports}
                />
              );
            }}
            dataKey='documentSelect'
            width={70}
            cellRenderer={({rowData}) => {
              return (
                <Checkbox
                  // checked={false}
                  checked={state.oada.data.Reports[rowData.documentKey].checked}
                />
              );
            }}
          />

          <Column label='Date' dataKey='documentKey' width={200} />

          <Column
            width={400}
            label='Number of Documents'
            dataKey='numDocsToShare'
          />

          <Column
            width={400}
            label='Number of Expired Documents'
            dataKey='numExpiredDocuments'
          />

          <Column
            width={400}
            label='Number of Documents not Shared'
            dataKey='numDocsNotShared'
          />
        </RTable>
      )}
    </AutoSizer>
  )
}

export default DocumentSharesTable
