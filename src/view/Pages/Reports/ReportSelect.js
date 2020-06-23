import React from 'react';

/** @jsx jsx */
import {jsx, css} from '@emotion/core'

import {Input, Button, Icon, Popup} from 'semantic-ui-react'
import overmind from '../../../overmind'
import helpCircle from './icons/helpCircle';

import 'semantic-ui-css/semantic.min.css'
import actions from 'src/overmind/app/actions';

const tabName = {
  'eventLog': 'History',
  'userAccess':
    <div>
      <div>{'Current State:'}</div>
      <div>{'Trading Partners Access'}</div>
    </div>,
  'documentShares':
    <div>
      <div>{'Current State:'}</div>
      <div>{'Document Recipient List'}</div>
    </div>,
};

const tooltip = {
  'eventLog': (
    <div>
      <div
        css={css`
          font-weight: bold;
        `}
      >History Report</div>
      <div>{`Shows all documents that were sent out during a set date range.
    Conatins recipients' emails and the date when documents were sent out.`
      }</div>
    </div>
  ),

  'userAccess': (
    <div>
      <div
        css={css`
          font-weight: bold;
        `}
      >
        <div>Current State:</div>
        <div>Trading Partner Access</div>
      </div>
      <div>{
        `Shows connections betewen trading partners and documents based on trading partners.
        Contains a list of all trading partners and the documents they have access to.`
      }</div>
    </div>
  ),

  'documentShares': (
    <div>
      <div
        css={css`
        font-weight: bold;
      `}
      >
        <div>Current State:</div>
        <div>Document Recipient List</div>
      </div>
      <div>{
        `Shows connections between documents and trading partners based on documents.
        Contains a list of all documents and the trading partners who have access to them.`
      }</div>
    </div>
  ),
};

function ReportSelect() {
  const {actions, state} = overmind();
  const myActions = actions.view.Pages.Reports;
  return (
    <div css={css`
      display: flex;
      direction: row;
      align-items: center;
    `}>
      <div css={css`
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: 4fr 6fr;
        grid-column-gap: 20px;
        alignItems: center
      `}>
        <div css={css`
            grid-column-start: 1;
            height: 100%;

            display: grid;
            grid-template-columns: repeat(3, 1fr);
          `}
        >
          <ReportTab name='eventLog' />
          <ReportTab name='userAccess' />
          <ReportTab name='documentShares' />
        </div>
        <div
          css={css`
            display: flex;
            justify-content: flex-end;
            padding-top: 10px;
            padding-bottom: 10px;
            & .button {
              background-color: #fff;
              border: 1px solid #979797;
              border-radius: 20px;
              font-size: 14px;
              .download.icon:before {
                color: #0061C0
              }
            }
          `}
        >
          <Button icon onClick={myActions.saveReports}>
            <Icon name='download' />
            <span
              css={css`
              margin-left: 10px;
              margin-right: 4px;
              color: #0061C0;
            `}
            >Download</span>
          </Button>
        </div>
      </div>
    </div >
  );
}

function ReportTab({onClick, name}) {
  const {actions, state} = overmind();

  return (
    <div
      css={css`
        border-top: 1px solid #979797;
        border-right: 1px solid #979797;
        border-left: 1px solid #979797;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        ${name === state.view.Pages.Reports.selectedReport
          ? `background: linear-gradient(
              180deg,
              rgba(0, 106, 211, 1) 0%,
              rgba(0, 84, 166, 1) 100%
            );
            color: #fff;`
          : '#fff;'
        }
      `}
      onClick={() => actions.view.Pages.Reports.reportSelect(name)}
    >
      <div
        css={css`
          margin-left: 10px;
          margin-right: 5px;
          place-self: center;
          font-size: 15;
        `}
      >{tabName[name]}</div>
      <div
        css={css`
          width: 20px;
        `}
      >
        {name === state.view.Pages.Reports.selectedReport
          ? <Popup
            trigger={<Icon name='question circle' />}
            content={tooltip[name]}
            position='right center'
          />
          : null
        }
      </div>
    </div>
  );
}

export default ReportSelect;
