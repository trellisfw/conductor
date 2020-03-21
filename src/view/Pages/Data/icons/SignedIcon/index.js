import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import icon from './signed.svg';

function signedIcon(props) {
  return (
    <img
      css={{
        height: (props.height || '18px'),
        filter: 'invert(42%) sepia(89%) saturate(4964%) hue-rotate(126deg) brightness(100%) contrast(98%)'
      }}
      src={icon} />
  );
}

export default signedIcon;
