import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";

import { Input, Button, Icon } from "semantic-ui-react";
import overmind from "../../../overmind";

import "semantic-ui-css/semantic.min.css";

function TopBar() {
  const { actions } = overmind();
  const myActions = actions.view.Pages.Reports;
  return (
    <div
      css={css`
        display: flex;
        direction: row;
        justify-content: space-between;
        align-items: center;
        padding-top: 15px;
        padding-left: 20px;
        padding-right: 20px;
        padding-bottom: 10px;
        & .button {
          background-color: #fff;
          border: 1px solid #979797;
          border-radius: 20px;
          font-size: 14px;
          .plus.icon:before {
            color: #0061c0;
          }
        }
      `}
    >
      <div css={{ fontSize: 27, marginRight: 15 }}>{"Reports"}</div>
      <div
        css={css`
          grid-column-start: 2;
          display: grid;
          /* grid-column-gap: 10px; */
          grid-template-columns: 1fr 3fr 1fr 3fr;
        `}
      >
        <div
          css={css`
            grid-column-start: 1;
            place-self: center end;
          `}
        >
          start:{" "}
        </div>
        <Input
          css={css`
            grid-column-start: 2;
            margin-left: 10px;
          `}
          type="date"
          id="user-search"
          style={{ borderRadius: 38, paddingBottom: 5, paddingTop: 5 }}
          onChange={(evt) => myActions.onStart(evt.target.value)}
        />
        <div
          css={css`
            grid-column-start: 3;
            place-self: center end;
          `}
        >
          end:{" "}
        </div>
        <Input
          css={css`
            grid-column-start: 4;
            margin-left: 10px;
          `}
          type="date"
          id="user-search"
          placeholder="End..."
          style={{ borderRadius: 38, paddingBottom: 5, paddingTop: 5 }}
          onChange={(evt) => myActions.onEnd(evt.target.value)}
        />
      </div>
    </div>
  );
}

export default TopBar;
