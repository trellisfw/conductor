import React from 'react';

/** @jsx jsx */
import { jsx } from '@emotion/core'
import Files from './Files';

function Pages() {
  return (
    <div css={{
      display: 'flex',
      flex: '1',
      boxShadow: 'inset 5px 5px 5px #dddddd'
    }}>
      <Files />
    </div>
  );
}

export default Pages;
