import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import moment from 'moment'
import _ from 'lodash'
import { Header, Message} from 'semantic-ui-react'

function MessageLog() {
  const { actions, state } = overmind();
  const {path} = state.view.MessageLog;
  let messages = [];
  if (path) {
    let document = _.get(state, path) || {};
    let jobs = _.get(document, `_meta.services.target.jobs`)
    Object.values(jobs || {}).forEach(({updates}) => {
      messages.push(...Object.values(updates || {})
        .filter(obj => obj.information || obj.meta)
        .map(obj => ({
          text: obj.information || obj.meta,
          time: (moment(obj.time, 'X').year() > 2000 ? moment(obj.time, 'X').add(4, 'hours') : moment(obj.time)).fromNow()
        }))
      )
    })
  }

  return (
    <div>
      <Header as="h4">Message Log</Header>
      {(messages || []).map(msg => 
        <Message info css={{display: 'flex', flexDirection: 'row'}}>
          <p css={{flex: '1'}}>{msg.text}</p>
          <p>{msg.time}</p>
        </Message>
      )} 
    </div>
  );
}

export default MessageLog;
