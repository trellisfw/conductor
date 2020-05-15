import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import icon from './processing.svg';

function processingIcon(props) {
  return (
    <img
      css={{
        height: (props.height || '20px')
      }}
      src={icon} />
  );
}

export default processingIcon;
