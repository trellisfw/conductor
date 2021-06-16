import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import icon from "./target_logo.png";
import { Popup } from "semantic-ui-react";

function TargetIcon(props) {
  return (
    <Popup
      content="Processed by Target"
      position="right center"
      trigger={
        <img
          css={{
            height: props.height || "40px",
            marginTop: "3px",
          }}
          src={icon}
        />
      }
    />
  );
}

export default TargetIcon;
