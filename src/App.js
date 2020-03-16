import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from './overmind'

import TopBar from './view/TopBar';
import SideBar from './view/SideBar';
import Pages from './view/Pages';
import FileDetailsModal from './view/Modals/FileDetailsModal';
import EditRuleModal from './view/Modals/EditRuleModal';
import PDFViewerModal from './view/Modals/PDFViewerModal';
import Login from './Login';

function App() {
  const { state, actions } = overmind();
  if (!state.login.loggedIn) {
    return <Login />
  }
  return (
    <div css={{
      height: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'stretch'
    }}>

      <TopBar />
      <div css={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch'
      }}>
        <SideBar />
        <Pages />
        <FileDetailsModal />
        <EditRuleModal />
        <PDFViewerModal />
      </div>

    </div>
  );
}

export default App;
