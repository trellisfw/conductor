import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import TopBar from './TopBar';
import Table from './Table';
import RecentsTopBar from './RecentsTopBar';
import Dropzone from './Dropzone';
import overmind from '../../../overmind'

function Data({}) {
  const { state } = overmind();
  const myState = state.view.Pages.Data;
  const some = myState.Table.some(obj => obj.identified);
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
      `}/>
      <div css={{flex: 1, padding: 30, paddingTop: 15, display: 'flex'}}>
        <div css={{border: '1px solid #979797', flex: 1, display: 'flex'}}>
          <Dropzone open={myState.openFileBrowser}>
            <Table docType='documents' identified={false}/>
          </Dropzone>
        </div>
      </div>
      {some ? <RecentsTopBar /> : undefined}
      {some ? <div css={css`
        height: 1px;
        background: #979797;
        margin-left: 20px;
        margin-right: 20px;
      `}/> : undefined }
      {some ? <div css={{flex: 1, padding: 30, paddingTop: 15, display: 'flex'}}>
        <div css={{border: '1px solid #979797', flex: 1, display: 'flex'}}>
          <Table docType='documents' identified={true}/>
        </div>
      </div> : undefined }
    </div>
  );
}

export default Data;
