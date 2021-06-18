import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";

import overmind from "../../../overmind";
import _ from "lodash";

function SideBar(props) {
  const { state, actions } = overmind();
  let myActions = actions.view.Modals.RulesModal;
  let myState = state.view.Modals.RulesModal.List;
  let templates = state.rules.templates;
  let categories = _.clone(myState.categories);
  Object.values(templates).forEach((r) => categories.push(...r.categories));
  categories = _.uniq(categories);

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      {categories.map((c) => (
        <span
          onClick={(evt) => {
            myActions.categorySelected(evt);
          }}
          key={"new-rule-category-" + c}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

export default SideBar;
