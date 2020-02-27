

import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import 'react-virtualized/styles.css';
import {Column, Table as RTable, AutoSizer} from 'react-virtualized';
import overmind from '../../../overmind'
import _ from 'lodash';
import moment from 'moment';
import UploadingIcon from './icons/UploadIcon';
import ProcessingIcon from './icons/ProcessingIcon';
import SignedIcon from './icons/SignedIcon';
import TargetIcon from './icons/TargetIcon';
import classnames from 'classnames';

function Table() {
  const { actions, state } = overmind();
  const myActions = actions.view.Pages.Data.Table;
  var collection = _.map(_.get(state, 'oada.data.documents'), (document, documentKey) => {
    //Pull out status from services
    const tasks = _.get(document, '_meta.services.target.tasks') || {};
    const fileDetails = {};
    _.forEach(tasks, (task) => {
      const statuses = _.get(task, 'status') || {};
      const identify = _.find(statuses, {status: 'identified'});
      if (identify != null) {
        fileDetails.type = _.get(identify, 'type')
        fileDetails.format = _.get(identify, 'format')
        return false;
      } else {
        const failed = _.find(statuses, {status: 'error'});
        if (failed != null) {
          fileDetails.type = 'Unknown'
          fileDetails.format = 'Unknown'
          return false;
        }
      }
    })
    // Check if Target service exists and is handling this document:
    const processingService = (_.keys(tasks).length > 0) ? 'target' : false;

    //Pull out share status
    // Aaron changed this to stay bold unless ALL share tasks are approved.
    const shared = (_.chain(document).get('_meta.services.approval.tasks').every(t => t.status === 'approved')).value();

    //Pull out signature from audit
    var signatures = _.chain(document).get('audits').values().get(0).get('signatures').value() || [];
    if (signatures.length == 0) signatures = _.chain(document).get('cois').values().get(0).get('signatures').value() || [];
    return {
      documentKey: documentKey,
      filename: _.get(document, 'pdf._meta.filename') || '',
      type: fileDetails.type,
      status: fileDetails.type == null ? 'processing' : null,
      format: fileDetails.format,
      createdAt: moment.utc(_.get(document, '_meta.stats.created'), 'X').local().format('M/DD/YYYY h:mm a'),
      createdAtUnix: _.get(document, '_meta.stats.created'),
      signed: (signatures.length > 0) ? true : false,
      shared: shared,
      processingService,
    }
  })
  //Sort collection
  collection = _.orderBy(collection, ['createdAtUnix'], ['desc']);
  _.forEach(_.get(state, 'view.Pages.Data.uploading'), (file) => {
    collection.unshift({
      filename: file.filename,
      status: 'uploading'
    })
  });
  return (
      <AutoSizer>
        {({ height, width }) => (
          <RTable
            css={css`
              & .ReactVirtualized__Table__headerRow.odd {
                background: rgb(0,106,211);
                background: linear-gradient(180deg, rgba(0,106,211,1) 0%, rgba(0,84,166,1) 100%);
              }
              & .header > span {
                color: #fff;
                text-transform: none;
              }
              & .row {
                cursor: pointer;
              }
              & .odd {
                background-color: #EFEFEF;
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
              var className = null;
              if (index % 2 === 0) {
                className = "row even"
              } else {
                className = "row odd"
              };
              if (collection[index] && !collection[index].shared) className = classnames(className, 'unshared')
              return className;
            }}
            rowHeight={30}
            width={width}
            onRowClick={myActions.onRowClick}>
            <Column label='' dataKey='processingService' width={40} cellRenderer={({rowData}) => 
              (!rowData || rowData.processingService !== 'target') ? '' :
              <TargetIcon />
            }/>
              
            <Column label="Name" dataKey="filename" width={200} />
            <Column width={200} label="Type" dataKey="type" cellRenderer={({rowData}) => {
              if (rowData.type) {
                return (
                  <div>{rowData.type}</div>
                )
              } else if (rowData.status == 'processing') {
                return (
                  <div css={{display: 'flex', alignItems: 'center'}}>
                    <ProcessingIcon />
                    <div css={{marginLeft: 3}}>{'Processing...'}</div>
                  </div>
                )
              } else if (rowData.status == 'uploading') {
                return (
                  <div css={{display: 'flex', alignItems: 'center'}}>
                    <UploadingIcon />
                    <div css={{marginLeft: 3}}>{'Uploading...'}</div>
                  </div>
                )
              } else {
                return <div>{'Unknown'}</div>
              }
            }} />
            <Column width={140} label="Added" dataKey="createdAt" />
            <Column dataKey="name" className="signature" width={width-600} cellRenderer={({rowData}) => {
              if (!rowData.signed) return null;
              return (
                <div css={{display: 'flex', alignItems: 'center'}}>
                  <SignedIcon />
                  <div css={{marginLeft: 3, color: '#02A12B'}}>{'Signed'}</div>
                </div>
              )
            }} />
          </RTable>
        )}
      </AutoSizer>
  );
}

export default Table;
