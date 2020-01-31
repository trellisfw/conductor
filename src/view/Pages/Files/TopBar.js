import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Input } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

function TopBar() {
  return (
    <div css={{
      display: 'flex',
      direction: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 15,
      paddingLeft: 20,
      paddingRight: 20,
      paddingBottom: 10,
    }}>
      <div css={{display: 'flex', alignItems: 'center'}}>
        <div css={{fontSize: 27, marginRight: 15}}>{'Files'}</div>
        <Input icon='search' iconPosition='left'  placeholder='Search...' style={{borderRadius: 38}} />
      </div>
      <div>{'Add'}</div>
    </div>
  );
}

export default TopBar;
