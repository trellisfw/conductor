/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'

function NewRulesList(props) {
  const {state, actions} = overmind();
  let templates = state.rules.templates;
  let myActions = actions.view.Modals.RulesModal;
  let pattern = /(input[0-9]+)/g;

  return (
    <div
      css={css`
        display: flex;
        flex: 1;
        justify-content: flex-start;
        flex-wrap: wrap;
      `}
    >
    {Object.values(templates).map((r, j) =>
      <div
        onClick={(evt) => {myActions.newRuleSelected(r)}}
        key={'newrulecard'+j}>
        <div css={css`
          position: relative;
          top: 0px;
          border: 1px solid rgba(34,36,38,.15);
          padding: 20px;
          border-radius: 12px;
          margin: 7px;
          cursor: pointer;
          max-width: 350px;
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
            r.text.split(pattern).map((item, j) =>
              pattern.test(item) ?
                <span css={{fontWeight: 800}} key={`newrule-${j}-boldword-${j}`}>{r[item].text}</span>
                :
                <span css={{fontWeight: 100}} key={`newrule-${j}-word-${j}`}>{item}</span>
              )
          }
          </div>
        </div>
      </div>
      )}
    </div>
  )
}

export default NewRulesList;
