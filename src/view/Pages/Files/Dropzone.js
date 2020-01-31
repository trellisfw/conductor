import React, {useCallback} from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import {useDropzone} from 'react-dropzone'
import overmind from '../../../overmind'

function Dropzone(props) {
  const { actions } = overmind();
  const myActions = actions.view.Pages.Files.Dropzone;
  const onDrop = useCallback(acceptedFiles => {
    if (myActions.filesDropped) myActions.filesDropped(acceptedFiles);
  }, [])
  const {getRootProps, getInputProps, isDragActive, open} = useDropzone({onDrop, noClick: true})
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
