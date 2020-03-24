import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import TopBar from './TopBar';
import overmind from '../../../overmind'

function Rule(props) {
  const {actions} = overmind()
  const myActions = actions.view.Pages.Rules;
  const pattern = /(input[0-9]+)/g;
  
  return (
    <div 
      onClick={evt => {myActions.ruleSelected(props.id)}}
      css={css`
      padding: 10px;
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
      <p key={'current-rule-'+props.id}>
         {props.rule.text.split(pattern).map((item, i) =>
           pattern.test(item) ? 
           <b key={props.id+'-boldword-'+i}>{props.rule[item].values.join(', ')}</b> 
           :
           item
         )}
       </p>
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
