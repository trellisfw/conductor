/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import _ from "lodash";

import iconData from "./data.svg";
import iconConnections from "./connections.svg";
import overmind from "../../overmind";

const activeSideSelection = {
  img: {
    filter:
      "invert(22%) sepia(76%) saturate(6476%) hue-rotate(201deg) brightness(92%) contrast(100%)",
    opacity: 0.6,
  },
  div: {
    color: "#0066CB",
  },
};

function SideSection(props) {
  const { actions } = overmind();
  const myActions = actions.view.SideBar;
  return (
    <div
      onClick={(evt) => {
        myActions.pageSelected(props.name);
      }}
      css={css`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 125px;
        width: 150px;
        cursor: pointer;
        border-bottom: 1px solid #979797;
        &:hover {
          ${activeSideSelection}
        }
        &.selected {
          ${activeSideSelection}
        }
        & img {
          opacity: 0.41;
        }
        & div {
          opacity: 0.84;
        }
      `}
      className={props.selected ? "selected" : null}
    >
      <img
        css={{
          height: "41px",
          paddingBottom: "7px",
        }}
        src={props.icon}
        fill={"#666"}
      />
      <div>{props.children}</div>
    </div>
  );
}

function SideBar() {
  const { state } = overmind();
  const tp = state.view.tp;
  let selectedPage = state.view.Pages.selectedPage;
  if (selectedPage === null) {
    //Pick first page that we have data for and access to
    const pages = [
      {
        type: "documents",
        page: "Data",
        showIfEmpty: true,
      },
      {
        type: "cois",
        page: "COIS",
      },
      {
        type: "fsqa-audits",
        page: "Audits",
      },
      {
        type: "fsqa-certificates",
        page: "Certificates",
      },
      {
        type: "letters-of-guarantee",
        page: "LettersOfGuarantee",
      },
    ];
    _.forEach(pages, (page) => {
      if (_.get(state.app.config, `tabs.${page.type}`) === true) {
        if (page.showIfEmpty || !_.isEmpty(_.get(state.oada.data, page.type))) {
          selectedPage = page.page;
          return false;
        }
      }
    });
  }

  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #979797",
      }}
    >
      {!state.app.config.tabs.documents ||
      state.oada.data.documents === null ? null : (
        <SideSection
          selected={selectedPage === "Data"}
          name={"Data"}
          icon={iconData}
        >
          {"Unidentified Files"}
        </SideSection>
      )}
      {!state.app.config.tabs.cois ||
      state.oada.data.cois === null ||
      _.isEmpty(state.oada.data.cois) ? null : (
        <SideSection
          selected={selectedPage === "COIS"}
          name={"COIS"}
          icon={iconData}
        >
          {"COIS"}
        </SideSection>
      )}
      {!state.app.config.tabs.audits ||
      state.oada.data["fsqa-audits"] === null ||
      _.isEmpty(state.oada.data["fsqa-audits"]) ? null : (
        <SideSection
          selected={selectedPage === "Audits"}
          name={"Audits"}
          icon={iconData}
        >
          {"Audits"}
        </SideSection>
      )}
      {!state.app.config.tabs.certificates ||
      state.oada.data["fsqa-certificates"] === null ||
      _.isEmpty(state.oada.data["fsqa-certificates"]) ? null : (
        <SideSection
          selected={selectedPage === "Certificates"}
          name={"Certificates"}
          icon={iconData}
        >
          {"Certificates"}
        </SideSection>
      )}
      {!state.app.config.tabs.lettersOfGuarantee ||
      state.oada.data["letters-of-guarantee"] === null ||
      _.isEmpty(state.oada.data["letters-of-guarantee"]) ? null : (
        <SideSection
          selected={selectedPage === "LettersOfGuarantee"}
          name={"Letters of Guarantee"}
          icon={iconData}
        >
          {"Letters of Guarantee"}
        </SideSection>
      )}
      {tp || !state.app.config.tabs.reports ? null : (
        <SideSection
          selected={selectedPage === "Reports"}
          name={"Reports"}
          icon={iconData}
        >
          {"Reports"}
        </SideSection>
      )}
      {tp || !state.app.config.tabs.rules ? null : (
        <SideSection
          selected={selectedPage === "Rules"}
          name={"Rules"}
          icon={iconConnections}
        >
          {"Rules"}
        </SideSection>
      )}
    </div>
  );
}

export default SideBar;
