/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@emotion/core";

import { Dropdown } from "semantic-ui-react";
import overmind from "../../overmind";

function TopBar() {
  const { actions, state } = overmind();
  const skin = state.app.skin;
  const tp = state.view.tp;

  let partnerInfo = tp ? (
    <div>
      <div css={{ fontWeight: "bold", display: "flex", flexDirection: "row" }}>
        Trading Partner:
        <div css={{ fontWeight: "normal" }}>{` ${tp}`}</div>
      </div>
    </div>
  ) : (
    <div>Smithfield</div>
  );

  let tpItem = tp ? (
    <Dropdown.Item
      icon="sign-out"
      text="Back to Smithfield"
      value="sf"
      onClick={actions.view.TopBar.toSmithfield}
    />
  ) : undefined;

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        height: "100px",
        borderBottom: "1px solid #979797",
      }}
    >
      <img
        css={{
          height: "50px",
          paddingLeft: "20px",
        }}
        src={"skins/" + skin + "/" + state.app.skins[skin].logo.src}
        alt="logo"
      />
      <div css={{ marginRight: 50, display: "flex", flexDirection: "column" }}>
        <Dropdown fluid icon="user circle" text={state.login.name}>
          <Dropdown.Menu direction="left">
            {tpItem}
            <Dropdown.Item
              icon="sign-in"
              text="Login as Trading Partner"
              value="tp"
              onClick={actions.view.TopBar.tpSelect}
            />
            <Dropdown.Item
              icon="power"
              text="Logout"
              value="logout"
              onClick={actions.view.TopBar.logout}
            />
          </Dropdown.Menu>
        </Dropdown>
        {partnerInfo}
      </div>
    </div>
  );
}

export default TopBar;
