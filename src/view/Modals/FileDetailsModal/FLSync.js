import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import moment from 'moment'
import _ from 'lodash'
import { Button, Header, Icon} from 'semantic-ui-react'

function FLSync() {
  const { actions, state } = overmind();
  const myState = state.view.Modals.FileDetailsModal;
  const myActions = actions.view.Modals.FileDetailsModal;

  let valid = _.get(myState, ['document', '_meta', 'services', 'fl-sync', 'valid', 'status'])

  //Show assessment link if associated
  let aLink;
  let aId = _.get(myState, ['document', '_meta', 'services', 'fl-sync', 'assessment'])
  if (aId) {
    let aText = "View the Assessment in Food Logiq"
    let aPath = `https://sandbox.foodlogiq.com/businesses/5acf7c2cfd7fa00001ce518d/internal-reviews/summary/${aId}`
    aLink = <a target="_blank" rel="noopener noreferrer" href={aPath}>{aText}</a>
  } 

  //Show document link if associated
  let dLink;
  let dId = _.get(myState, ['document', '_meta', 'services', 'fl-sync', 'flId'])
  if (dId) {
    let dText = "View the Document in Food Logiq"
    let dPath = `https://sandbox.foodlogiq.com/businesses/5acf7c2cfd7fa00001ce518d/documents/detail/${dId}`
    dLink = <a target="_blank" rel="noopener noreferrer" href={dPath}>{dText}</a>
  } 

  let validText = valid === true ? 
    <div css={{fontWeight: 'bold', color: 'green'}}>
      Trellis-extracted PDF data matches user-entered Food Logiq data. 
    </div>
    : valid === false ? 
      <div css={{fontWeight: 'bold', color: 'red'}}>
        Document rejected in Food Logiq
      </div>
    : <div>
       Awaiting validation of extracted data... 
      </div>

  return (
    <div>
      <Header as="h4">Food Logiq</Header>
      {validText}
      {dLink}
      {aLink ? <br /> : null}
      {aLink}
    </div>
  );
}

export default FLSync;
