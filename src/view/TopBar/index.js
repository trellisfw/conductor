import React from 'react';

/** @jsx jsx */
import { jsx } from '@emotion/core'

import logo from './smithfield.svg'

function TopBar() {
  return (
    <div css={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      height: '100px',
      borderBottom: '1px solid #979797'
    }}>
      <img css={{
        height: '50px',
        paddingLeft: '20px'
      }} src={logo} alt="logo" />
      <div css={{marginRight: 20}}>{'Michael Gaspers'}</div>
    </div>
  );
}

export default TopBar;
