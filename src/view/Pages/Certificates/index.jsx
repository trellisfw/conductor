import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";

import TopBar from "./TopBar";
import Table from "./Table";
import overmind from "../../../overmind";

function Data() {
  const { state } = overmind();
  const myState = state.view.Pages.Certificates;
  return (
    <div
      css={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TopBar />
      <div
        css={css`
          height: 1px;
          background: #979797;
          margin-left: 20px;
          margin-right: 20px;
        `}
      />
      <div css={{ flex: 1, padding: 30, paddingTop: 15, display: "flex" }}>
        <div css={{ border: "1px solid #979797", flex: 1, display: "flex" }}>
          <Table docType="fsqa-certificates" />
        </div>
      </div>
    </div>
  );
}

export default Data;
