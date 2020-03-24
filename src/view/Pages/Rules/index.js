import React from 'react';
import _ from 'lodash';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import TopBar from './TopBar';
import {Button, Icon} from 'semantic-ui-react'
import overmind from '../../../overmind'

function Rule(props) {
  const {actions} = overmind()
  const myActions = actions.view.Pages.Rules;
  const pattern = /(input[0-9]+)/g;
  
  return (
    <div 
      css={css`
      padding: 10px;
      display: flex;
      flex-direction: row;
      align-content: center;
      margin: 10px;
      border: 1px solid #000000;
      border-radius: 5px;
      box-shadow: 5px 5px 5px grey;
      text-align: center;
      font-size: 17px;
      &.hover {
        border: 2px solid #2a9fd8;
      }
    `}>
      <p 
        key={'current-rule-'+props.id}
        css={css`
          flex: 1
        `}>
         {props.rule.text.split(pattern).map((item, i) =>
           pattern.test(item) ? 
           <b key={props.id+'-boldword-'+i}>{_.values(props.rule[item].values).map(o => o.name).join(', ')}</b> 
           :
           item
         )}
       </p>
      <Button 
        icon
        primary
        onClick={evt => {myActions.editRuleClicked(props.rule)}}>
      <Icon name='edit'/>
    </Button>
    </div>
  );
}

function Rules() {
  const {state} = overmind()
  const rules = state.rules.rules;

  return (
    <div css={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column'
    }}>
      <TopBar />
      <div css={css`
        height: 1px;
        background: #979797;
        margin-left: 20px;
        margin-right: 20px;
      `}/>
      <div css={{flex: 1, padding: 30, paddingTop: 15, display: 'flex'}}>
        <div css={{flex: 1,  flexDirection:'column', display: 'flex'}}>
        {Object.keys(rules).map(key => 
          <Rule rule={rules[key]} id={key} key={key}/>
        )}
        </div>
      </div>
    </div>
  );
}

export default Rules;
