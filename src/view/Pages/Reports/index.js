import React from 'react';

/** @jsx jsx */
import {jsx, css} from '@emotion/core'

import TopBar from './TopBar';
import ReportSelect from './ReportSelect';
import EventLogTable from './EventLogTable';
import UserAccessTable from './UserAccessTable';
import DocumentSharesTable from './DocumentSharesTable';
import overmind from '../../../overmind'

function Data() {
  const {state} = overmind();
  const myState = state.view.Pages.Reports;
  return (
    <div css={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <TopBar />

      <div css={css`
        height: 1px;
        background: #979797;
        margin-left: 20px;
        margin-right: 20px;
      `} />

      <div css={{flex: 1, padding: 30, paddingTop: 15, display: 'flex', flexDirection: 'column'}}>
        <ReportSelect />
        <div css={{flex: 1, display: 'flex'}}>
          <div css={{border: '1px solid #979797', flex: 1, display: 'flex'}}>
            {state.view.Pages.Reports.selectedReport === 'event log' ?
              <EventLogTable docType='Reports' />
              : null
            }
            {state.view.Pages.Reports.selectedReport === 'user access' ?
              <UserAccessTable docType='Reports' />
              : null
            }
            {state.view.Pages.Reports.selectedReport === 'document shares' ?
              <DocumentSharesTable docType='Reports' />
              : null
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Data;
