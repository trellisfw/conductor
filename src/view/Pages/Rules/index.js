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
  let r = props.rule;
  return (
    <div
      onClick={() => {myActions.editRuleClicked(r)}}>
      <div css={css`
        position: relative;
        top: 0px;
        border: 1px solid rgba(34,36,38,.15);
        padding: 20px;
        border-radius: 12px;
        margin: 7px;
        cursor: pointer;
        transition: all 300ms;
        transition-property: box-shadow, top;
        &:hover {
          box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.25);
          top: -2px;
          border: 1px solid #fff;
        }
      `}>
        <div css={{fontSize: 16}}>
        {
          r.text.split(pattern).map((item, j) => {
            if (pattern.test(item)) {
              let text = _.values(r[item].values).map(o => o.name);
              if (text.length == 0) {
                return (
                  <span css={{fontWeight: 800}} key={`newrule-${j}-boldword-${j}`}>
                    {'anything'}
                  </span>
                )
              } else {
                return _.map(text, (t, idx) => {
                  return (
                    <div css={{display: 'contents'}} key={`newrule-${j}-boldword-${idx}`}>
                      <span css={{fontWeight: 800}}>{t}</span>
                      {
                        (idx == (text.length-1)) ? null :<span>{' or '}</span>
                      }
                    </div>
                  )
                })
              }
            } else {
              return (
                <span css={{fontWeight: 100}} key={`newrule-${j}-word-${j}`}>{item}</span>
              )
            }
          })
        }
        </div>
      </div>
    </div>
  )
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
