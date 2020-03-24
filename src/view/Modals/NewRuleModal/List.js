import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import moment from 'moment'
import ReactJson from 'react-json-view'
import SideBar from './SideBar';
import NewRulesList from './NewRulesList';

function List (props) {

  return (
    <div
      css={{
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'start'
      }}
    >
      <NewRulesList />
    </div>
  )
}

export default List
