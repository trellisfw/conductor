import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { Table } from "semantic-ui-react";

import Producer from "./Producer";
import Holder from "./Holder";
import Policies from "./Policies";

function CoI(props) {
  const { coi } = props;
  return (
    <Table celled striped>
      <Table.Body css={{ fontSize: 16 }}>
        <Producer coi={coi} />
        <Holder coi={coi} />
        <Policies coi={coi} />
      </Table.Body>
    </Table>
  );
}

export default CoI;
