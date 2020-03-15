import React from 'react';

/** @jsx jsx */
import { jsx } from '@emotion/core'
import Data from './Data';
import Rules from './Rules';
import overmind from '../../overmind'

function Pages() {
  const {state} = overmind();
  const selectedPage = state.view.Pages.selectedPage;
  return (
    <div css={{
      display: 'flex',
      flex: '1',
      boxShadow: 'inset 5px 5px 5px #dddddd'
    }}>
      {selectedPage === 'Data' ? <Data /> : null}
      {selectedPage === 'Rules' ? <Rules /> : null}
    </div>
  );
}

export default Pages;
