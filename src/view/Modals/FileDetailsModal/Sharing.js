import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Button, Dropdown, Icon } from 'semantic-ui-react'
import overmind from '../../../overmind'
import _ from 'lodash'
import ReactJson from 'react-json-view'

function Sharing(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.FileDetailsModal;
  const myState = state.view.Modals.FileDetailsModal;
  const shareOptions = _.chain(myState.share).map((share, key) => {
    if (share.status == 'approved') return null;
    var type = share.type;
    if (type == 'fl') type = 'FoodLogiQ';
    return {
      key,
      text: `${share['with']} - ${type}`,
      value: key
    }
  }).compact().value();
  const shareValue = _.chain(myState.share).map((share, key) => {
    if (share.status == 'pending') return key;
  }).compact().value();
  const approvedList = _.chain(myState.share).map((share) => {
    var type = share.type;
    if (type == 'fl') type = 'FoodLogiQ';
    if (share.status == 'approved') return `${share['with']} - ${type}`;
  }).compact().value();
  return (
    <div css={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between'}}>
      <div css={{fontSize: 27, marginBottom: 10, fontWeight: 'bold'}}>
        {'Share with others:'}
      </div>
      <div css={{display: 'flex'}}>
        <Dropdown
          css={{marginRight: 5}}
          placeholder='Select trading partners...'
          fluid
          multiple
          search
          selection
          options={shareOptions}
          value={shareValue}
          onChange={(evt, data)=>{myActions.onShareChange(data.value)}}
        />
        <Button icon primary labelPosition='left' disabled={(shareValue.length == 0)} onClick={myActions.share}>
          <Icon name='send' />
          Share
        </Button>
      </div>
      {
        (approvedList.length > 0) ?
        <div css={{fontSize: 15, color: '#787878', marginTop: 5}}>{'Shared with: ' + approvedList.join(', ')}</div>
        :
        null
      }
    </div>
  );
}
export default Sharing
