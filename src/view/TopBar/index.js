import React from 'react';

/** @jsx jsx */
import { jsx } from '@emotion/core'

import logo from './smithfield.svg'
import { Button, Dropdown } from 'semantic-ui-react'
import overmind from '../../overmind'


function TopBar() {
  const { actions, state } = overmind();
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
      <div css={{marginRight: 20}}>
          <Dropdown text={state.login.name}>
            <Dropdown.Menu>
              <Dropdown.Item icon='power' text='Logout' value='logout' onClick={actions.view.TopBar.logout} />
            </Dropdown.Menu>
          </Dropdown>
      </div>
    </div>
  );
}

export default TopBar;
