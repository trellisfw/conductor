import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";

import { Header, Icon } from "semantic-ui-react";
import SignedIcon from "../../icons/SignedIcon";
import overmind from "../../../overmind";
import _ from "lodash";

function MyHeader(props) {
  const { state } = overmind();
  const myState = state.view.Modals.FileDetailsModal;
  let title = "Unknown Document Type";
  if (myState.docType === "fsqa-audits") {
    title = `FSQA Audit`;
  } else if (myState.docType === "cois") {
    title = `Certificate of Insurance`;
  } else if (myState.docType === "fsqa-certificates") {
    title = `FSQA Certificate`;
  }

  let validState = _.get(myState, [
    "document",
    "_meta",
    "services",
    "fl-sync",
    "valid",
    "status",
  ]);
  let valid =
    validState === true ? (
      <div css={{ display: "flex", alignItems: "center" }}>
        <SignedIcon />
        <div css={{ marginLeft: 3, color: "#02A12B", marginRight: 7 }}>
          {"Valid"}
        </div>
      </div>
    ) : validState === false ? (
      <div css={{ display: "flex", alignItems: "center" }}>
        <Icon name="warning circle" />
        <div css={{ marginLeft: 3, color: "#f50057", marginRight: 7 }}>
          {"Invalid"}
        </div>
      </div>
    ) : null;

  let signed =
    Object.keys(_.get(myState, ["document", "signatures"]) || {}).length > 0 ? (
      <div css={{ display: "flex", alignItems: "center" }}>
        <SignedIcon />
        <div css={{ marginLeft: 3, color: "#02A12B", marginRight: 7 }}>
          {"Signed"}
        </div>
      </div>
    ) : undefined;

  let unmask = _.get(myState, ["document", "unmask"]) ? "MASKED" : null;

  return (
    <Header>
      <div css={{ display: "flex", justifyContent: "space-between" }}>
        <div>{title}</div>
        <div css={{ color: "red", fontWeight: "bold" }}>
          {unmask}
          {signed}
        </div>
      </div>
    </Header>
  );
}

export default MyHeader;
