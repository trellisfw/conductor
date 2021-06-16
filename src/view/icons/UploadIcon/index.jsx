import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import icon from "./upload.svg";

function uploadIcon(props) {
  return (
    <img
      css={{
        height: props.height || "18px",
      }}
      src={icon}
    />
  );
}

export default uploadIcon;
