/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'

function NewRulesList(props) {
  const {state, actions} = overmind();
  let templates = state.rules.templates;
  let myActions = actions.view.Modals.NewRuleModal;
  let pattern = /(input[0-9]+)/g;

  return (
    <div
      css={css`
        display: flex;
        flex: 1;
        justify-content: space-between;
        flex-wrap: wrap;
      `}
    >
    {Object.values(templates).map((r, j) =>
        <div
          onClick={(evt) => {myActions.newRuleSelected(r)}}
          key={'newrulecard'+j}
          css={css`
            display: flex;
            box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.15);
            padding: 20px;
            border-radius: 12px;
            margin: 15px;
            cursor: pointer;
          `}>
        <div>
          {r.text.split(pattern).map((item, j) =>
            pattern.test(item) ?
              <b key={`newrule-${j}-boldword-${j}`}>{r[item].text}</b>
              :
              item
            )
          }
        </div>
      </div>
      )}
    </div>
  )
}

export default NewRulesList;
