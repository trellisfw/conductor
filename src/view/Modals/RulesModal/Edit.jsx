/** @jsxRuntime classic */
/** @jsx jsx */
import { json } from "overmind";
import { jsx, css } from "@emotion/core";

import overmind from "../../../overmind";
import { Button, Dropdown, Popup, Search, Table } from "semantic-ui-react";
import _ from "lodash";

function BlankB(props) {
  const { state, actions } = overmind();
  let myState = state.view.Modals.RulesModal;
  let myActions = actions.view.Modals.RulesModal;
  let isEditing = myState.Edit.edit;
  let rule = myState.Edit.rule;
  let template = myState.Edit.template;
  let type = template[props.item].type;
  let list = json(state.rules[type]);
  const placeholder = template[props.item].text;
  let selected = Object.values(rule[props.item].values)
    .map((v) => v.name)
    .join(" or ");
  if (selected.length === 0) {
    if (isEditing) {
      selected = "anything";
    } else {
      selected = placeholder;
    }
  }

  const trigger = (
    <span
      css={css`
        color: rgba(0, 0, 0, 0.4);
        &:hover {
          color: #000;
        }
        &::before {
          content: "";
          background: #000;
          position: absolute;
          left: 1px;
          right: 1px;
          bottom: 3px;
          height: 2px;
        }
      `}
    >
      &nbsp;{selected}&nbsp;
    </span>
  );
  return (
    <Dropdown trigger={trigger} icon={null} pointing="top left">
      <Dropdown.Menu>
        {_.map(list, (i) => {
          return (
            <Dropdown.Item
              onClick={() => {
                myActions.textChanged({ values: [i.key], key: props.item });
              }}
              key={i.key}
            >
              {i.name}
            </Dropdown.Item>
          );
        })}
      </Dropdown.Menu>
    </Dropdown>
  );
}

function Edit(props) {
  const { state, actions } = overmind();
  let myState = state.view.Modals.RulesModal.Edit;
  let myActions = actions.view.Modals.RulesModal;
  let isEditing = myState.edit;
  let rule = myState.rule;
  let pattern = /(input[0-9]+)/g;
  let mappings = state.view.Modals.RulesModal.Mappings || {};
  let mappingType = state.view.Modals.RulesModal.Edit.rule.mappings;
  mappingType = mappingType.charAt(0).toUpperCase() + mappingType.slice(1);
  let results = state.view.Modals.RulesModal.Edit.mappingSearchResults || [];
  console.log(myState.sortCol, myState.list, myState.partners);

  return (
    <div
      css={{
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
      }}
    >
      <div
        css={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          css={css`
            text-align: center;
            font-size: 18px;
            line-height: 35px;
            & > span {
              display: contents;
            }
          `}
        >
          {rule.text
            .split(pattern)
            .map((item, j) =>
              pattern.test(item) ? (
                <BlankB key={"edit-new-rule-" + j} item={item} index={j} />
              ) : (
                <span key={"edit-new-rule-" + j}>{item}</span>
              )
            )}
        </div>
      </div>
      <Search
        onResultSelect={(evt, { result }) =>
          myActions.handleResultSelect(result)
        }
        onSearchChange={_.debounce(
          (evt, { value }) => myActions.searchMappings(value),
          500
        )}
        open={false}
        value={myState.mappingSearchValue}
      />
      <Table striped celled compact sortable>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{mappingType}</Table.HeaderCell>
            <Table.HeaderCell>Trading Partners</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {results.length > 0
            ? results
                .filter((val) => (mappings[val].name ? true : false))
                .map((refIndex) =>
                  mappings[refIndex].partners.map((p) => (
                    <Table.Row key={mappings[refIndex].name + p}>
                      <Table.Cell>
                        <Popup
                          content={mappings[refIndex].name}
                          trigger={<p>{mappings[refIndex].name}</p>}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Popup content={p} trigger={<p>{p}</p>} />
                      </Table.Cell>
                    </Table.Row>
                  ))
                )
            : mappings
                .filter((item, i) => results.indexOf(i) < 0)
                .filter((item) => (item.name ? true : false))
                .map((item) =>
                  item.partners.map((p) => (
                    <Table.Row key={item.name + p}>
                      <Table.Cell>
                        <Popup
                          content={item.name}
                          trigger={<p>{item.name}</p>}
                        />
                      </Table.Cell>
                      <Table.Cell>
                        <Popup content={p} trigger={<p>{p}</p>} />
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
        </Table.Body>
      </Table>
      <div
        css={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
          marginTop: 10,
        }}
      >
        {isEditing ? (
          <Button
            onClick={(evt) => {
              myActions.cancelClicked();
            }}
          >
            Cancel
          </Button>
        ) : (
          <Button
            onClick={(evt) => {
              myActions.backClicked();
            }}
          >
            Back
          </Button>
        )}
        {true /*!isEditing*/ ? null : (
          <Button
            style={{ marginLeft: 7 }}
            color="red"
            onClick={(evt) => {
              myActions.deleteClicked();
            }}
          >
            Delete
          </Button>
        )}
        <Button
          style={{ marginLeft: 7 }}
          primary
          onClick={(evt) => {
            myActions.doneClicked();
          }}
        >
          {isEditing ? "Save" : "Add Rule"}
        </Button>
      </div>
    </div>
  );
}

export default Edit;
