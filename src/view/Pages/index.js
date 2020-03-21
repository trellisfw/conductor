import React from 'react';

/** @jsx jsx */
import { jsx } from '@emotion/core'
import Data from './Data';

function Pages() {
  return (
    <div css={{
      display: 'flex',
      flex: '1',
      boxShadow: 'inset 5px 5px 5px #dddddd'
    }}>
      <Data />
    </div>
  );
}

export default Pages;
