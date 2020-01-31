import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import _ from 'lodash'
import ReactJson from 'react-json-view'

function Content(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.FileDetailsModal;
  const myState = state.view.Modals.FileDetailsModal;

  var jsonData = null;
  var jsonTitle = '';
  if (_.isEmpty(myState.audit) == false) {
    jsonData = _.get(myState, 'audit');
    jsonTitle = 'audit';
  } else if (_.isEmpty(myState.coi) == false) {
    jsonData = _.get(myState, 'coi');
    jsonTitle = 'coi';
  }
  return (
    <div>
      <div css={{
          color: '#2439FF',
          fontSize: 16,
          marginBottom: 7,
          display: 'flex',
          justifyContent: 'center'
        }}>
        <div css={{cursor: 'pointer'}} onClick={()=>myActions.viewPDF(_.get(myState, 'documentKey'))}>{'VIEW PDF'}</div>
      </div>
      {
        jsonData != null ? <ReactJson src={jsonData} collapsed={true} name={jsonTitle} /> : null
      }
    </div>
  )
}

export default Content
