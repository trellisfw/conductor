import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";

import { Input, Button, Icon } from "semantic-ui-react";
import overmind from "../../../overmind";

import "semantic-ui-css/semantic.min.css";

function TopBar() {
  const { actions } = overmind();
  const myActions = actions.view.Pages.Data;
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
      <div css={{ display: "flex", alignItems: "center" }}>
        <div css={{ fontSize: 27, marginRight: 15 }}>
          {"Unidentified Files"}
        </div>
        <Input
          type="search"
          id="user-search"
          icon="search"
          iconPosition="left"
          placeholder="Search..."
          style={{ borderRadius: 38 }}
          onChange={(evt) => myActions.onSearch(evt.target.value)}
        />
      </div>
      <Button icon onClick={() => myActions.openFileBrowser()}>
        <Icon name="plus" />
        <span
          css={{
            marginLeft: 7,
            marginRight: 4,
            color: "#0061C0",
            fontWeight: 100,
          }}
        >
          Add
        </span>
      </Button>
    </div>
  );
}

export default TopBar;
