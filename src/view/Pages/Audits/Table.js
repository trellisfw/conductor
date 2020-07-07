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
  const myActions = actions.view.Pages.Audits.Table
  const myState = state.view.Pages.Audits
  const collection = myState.Table || [];
  const il = infiniteLoader('Audits', myActions.loadDocumentKeys);
  const now = moment();
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
            & .ReactVirtualized__Table__Grid {
              padding-right: 2px;
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
          <Column label='Name' dataKey='filename' width={400} />
          <Column
            width={200}
            label='Type'
            dataKey='type'
            cellRenderer={({ rowData }) => {
              if (rowData.type) {
                if (rowData.masked) {
                  return <div>{`${rowData.type} - Masked`}</div>
                }
                return <div>{rowData.type}</div>
              } else if (rowData.status == 'processing') {
                return (
                  <div css={{ display: 'flex', alignItems: 'center' }}>
                    <ProcessingIcon />
                    <div css={{ marginLeft: 3 }}>{'Processing...'}</div>
                  </div>
                )
              } else if (rowData.status == 'uploading') {
                return (
                  <div css={{ display: 'flex', alignItems: 'center' }}>
                    <UploadingIcon />
                    <div css={{ marginLeft: 3 }}>{'Uploading...'}</div>
                  </div>
                )
              } else if (_.isEmpty(_.omit(rowData, 'documentKey'))) {
                return <div></div>
              } else {
                return <div>{'Unknown'}</div>
              }
            }}
          />
          <Column
            width={80}
            label='Score'
            dataKey='score'
            cellRenderer={({ rowData }) => {
              return `${_.get(rowData, 'score.value')}${_.get(rowData, 'score.units')}`;
            }}
          />
          <Column
            width={200}
            label='Valid'
            dataKey='valid'
            cellRenderer={({ rowData }) => {
              let validity = null
              if (rowData.validity) {
                validity = {
                  start: moment(rowData.validity.start, 'M/D/YYYY'),
                  end: moment(rowData.validity.end, 'M/D/YYYY')
                }
                if (!validity.start || !validity.start.isValid()) validity = null
                if (!validity.end || !validity.end.isValid()) validity = null
                // If it starts after today, or ended before today, it's expired
                validity.expired = validity.start.isAfter(now) || validity.end.isBefore(now)
              }
              let validLabel = 'Unknown';
              let validColor = 'red';
              if (!validity) {
                //Do nothing
              } else if (validity.expired) {
                if (validity.start.isAfter(now)) {
                  validLabel = `Begins ${validity.end.format('M/D/YYYY')}`
                  validColor = 'yellow';
                } else {
                  validLabel = `Expired ${validity.end.format('M/D/YYYY')}`
                  validColor = 'red'
                }
              } else {
                validLabel = `Until ${validity.end.format('M/D/YYYY')}`
                validColor = 'green'
              }
              return <div css={{color: validColor}}>{validLabel}</div>
            }}
          />
          <Column width={100} label='Shares' dataKey='shares' />
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
