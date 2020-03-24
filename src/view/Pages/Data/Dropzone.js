import React, { useEffect, useRef } from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import {useDropzone} from 'react-dropzone'
import overmind from '../../../overmind'

function Dropzone(props) {
  const { actions } = overmind();
  const myActions = actions.view.Pages.Data.Dropzone;
  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({onDrop: myActions.filesDropped, noClick: true})

  const prevOpen = useRef(false);
  useEffect(() => {
    if (!prevOpen.current && props.open) open();
    prevOpen.current = props.open;
  });

  return (
    <div css={{flex: 1, display: 'flex'}} {...getRootProps()}>
      {
        props.children
      }
      {
        <input id="user-search-2" {...getInputProps()} />
      }
    </div>
  );
}

export default Dropzone;
