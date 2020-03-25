import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import icon from './target_logo.png';

function processingIcon(props) {
  return (
    <img
      css={{
        height: (props.height || '40px'),
        marginTop: '3px',
      }}
      src={icon} />
  );
}

export default processingIcon;
