import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { Icon, Table } from "semantic-ui-react";

function Organization(props) {
  const { certificate } = props;
  const org =
    certificate.organization && certificate.organization.name
      ? certificate.organization.name
      : "Unknown";
  return (
    <Table.Row>
      <Table.Cell collapsing css={{ fontWeight: "bold" }}>
        Organization
      </Table.Cell>
      <Table.Cell>{org}</Table.Cell>
    </Table.Row>
  );
}

export default Organization;
