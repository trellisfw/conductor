import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import TopBar from './TopBar';
import overmind from '../../../overmind'

function Rule(props) {
  
  return (
    <div css={css`
      padding: 10px;
      align-content: center;
      margin: 10px;
      border: 1px solid #2a9fd8;
      border-radius: 5px;
      box-shadow: 10px 10px 5px grey;
      text-align: center;
      font-size: 17px;
      &.hover {
        border: 2px solid #2a9fd8;
      }
    `}>
    {props.rule.text[0].map((t, i) =>
      <sp>{t+' '}<b>{props.rule.text[1][i]+' '}</b></sp>
    )}
   </div>
  );
}

function Rules() {
  const {state} = overmind()
  console.log(state);
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
        <div css={{border: '1px solid #979797', flex: 1,  flexDirection:'column', display: 'flex'}}>
        {Object.keys(state.view.Pages.Rules.rules).map(key => 
          <Rule rule={state.view.Pages.Rules.rules[key]} key={key}/>
        )}
          
        </div>
      </div>
    </div>
  );
}

export default Rules;
