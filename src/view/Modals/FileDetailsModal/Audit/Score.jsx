import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import { Icon, Table } from "semantic-ui-react";
import _ from "lodash";

function Score(props) {
  const { audit } = props;
  return (
    <Table.Row>
      <Table.Cell collapsing css={{ fontWeight: "bold" }}>
        Score
      </Table.Cell>
      <Table.Cell>
        {`${_.get(audit, "score.final.value", "Unknown")} `}
        {!_.get(audit, "score.rating") ? (
          ""
        ) : (
          <span
            style={{
              color: _.get(audit, "score.rating", "").match(/(good|excellent)/i)
                ? "green"
                : "red",
            }}
          >
            ({_.get(audit, "score.rating", "Unknown").trim()})
          </span>
        )}
      </Table.Cell>
    </Table.Row>
  );
}

export default Score;
