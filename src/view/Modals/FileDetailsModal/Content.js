import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import _ from 'lodash'
import moment from 'moment'
import ReactJson from 'react-json-view'
import Audit from './Audit'
import CoI from './CoI'
import Certificate from './Certificate'

function Content (props) {
  const { actions, state } = overmind()
  const myActions = actions.view.Modals.FileDetailsModal
  const myState = state.view.Modals.FileDetailsModal

  var jsonData = _.get(myState, 'document')
  if (jsonData) {
    jsonData = _.cloneDeep(jsonData)
    if (jsonData._id) delete jsonData._id
    if (jsonData._rev) delete jsonData._rev
    if (jsonData._type) delete jsonData._type
    if (jsonData._meta) delete jsonData._meta
  }
  return (
    <div>
      {
        myState.type === 'audit' ? <Audit audit={myState.document} /> : null
      }
      {
        myState.type === 'coi' ? <CoI coi={myState.document} /> : null
      }
      {
        myState.type === 'certificate' ? <Certificate certificate={myState.document} /> : null
      }

      {!myState.showData ? (
        ''
      ) : jsonData == null ? (
        <span>&lt; No Data &gt;</span>
      ) : (
        <ReactJson
          src={jsonData}
          name={myState.type}
          collapsed={1}
          collapseStringsAfterLength={50}
          displayDataTypes={false}
          displayObjectSize={false}
          enableClipboard={false}
        />
      )}

      <div
        css={{
          color: '#2439FF',
          fontSize: 16,
          marginBottom: 7,
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div
          css={{ cursor: 'pointer' }}
          onClick={() => myActions.viewPDF({documentKey: myState.documentKey, docType: myState.docType})}
        >
          {'VIEW PDF'}
        </div>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <div
          css={{ cursor: 'pointer' }}
          onClick={() => myActions.downloadPDF({documentKey: myState.documentKey, docType: myState.docType})}
        >
          {'DOWNLOAD PDF'}
        </div>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        <div
          css={{ cursor: 'pointer' }}
          onClick={() =>
            myActions.toggleShowData(_.get(myState, 'documentKey'))
          }
        >
          {myState.showData ? 'HIDE DATA' : 'VIEW DATA'}
        </div>
      </div>
    </div>
  )
}

export default Content
