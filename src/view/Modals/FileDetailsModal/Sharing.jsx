import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";

import { Button, Dropdown, Icon, Table, Input } from "semantic-ui-react";
import overmind from "../../../overmind";
import _ from "lodash";
import ReactJson from "react-json-view";

function SharingTable({ list }) {
  //        <div css={{fontSize: 15, color: '#787878', marginTop: 5}}>{'Shared with: ' + approvedList.join(', ')}</div>
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.FileDetailsModal;
  const myState = state.view.Modals.FileDetailsModal;
  list = list || [];
  if (list.length === 0 && myState.sharedSearchValue.length === 0) return null;
  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>
            {"Shared with"}
            <Input
              size="mini"
              css={{ marginLeft: 10 }}
              icon="search"
              placeholder="Search..."
              onChange={(evt) =>
                myActions.onShareSearchChange(evt.target.value)
              }
              value={myState.sharedSearchValue}
            />
          </Table.HeaderCell>
          <Table.HeaderCell>Method</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {_.map(list, (share, index) => {
          var type = share.type;
          if (type === "fl") type = "FoodLogiQ";
          if (type === "shareWf") type = "Trellis";
          if (type === "ift") type = "IBM Food Trust";
          return (
            <Table.Row key={"share" + index}>
              <Table.Cell>{share.with}</Table.Cell>
              <Table.Cell>{type}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

function Sharing(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.FileDetailsModal;
  const myState = state.view.Modals.FileDetailsModal;
  const shareOptions = _.chain(myState.share)
    .map((share, key) => {
      if (share.status === "approved") return null;
      var type = share.type;
      if (type === "fl") type = "FoodLogiQ";
      if (type === "shareWf") type = "Trellis";
      if (type === "ift") type = "IBM Food Trust";
      return {
        key,
        text: `${share["with"]} - ${type}`,
        value: key,
      };
    })
    .compact()
    .value();
  const shareValue = _.chain(myState.share)
    .map((share, key) => {
      if (share.status === "pending") return key;
    })
    .compact()
    .value();
  return (
    <div
      css={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        marginTop: 7,
      }}
    >
      {/*<div css={{fontSize: 27, marginBottom: 10, fontWeight: 'bold'}}>
        {'Share with others:'}
      </div>*/}
      {/*<div css={{display: 'flex'}}>
        <Dropdown
          css={{marginRight: 5}}
          placeholder='Select trading partners...'
          fluid
          multiple
          search
          selection
          options={shareOptions}
          value={shareValue}
          onChange={(evt, data)=>{myActions.onShareChange(data.value)}}
        />
        <Button icon primary labelPosition='left' disabled={(shareValue.length === 0)} onClick={myActions.share}>
          <Icon name='send' />
          Share
        </Button>
      </div>*/}
      <SharingTable list={myState.sharedWithFiltered} />
    </div>
  );
}
export default Sharing;
