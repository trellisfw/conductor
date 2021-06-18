/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from "@emotion/core";

import overmind from "../../../overmind";
import moment from "moment";
import _ from "lodash";
import { Header, Message } from "semantic-ui-react";

function MessageLog() {
  const { state } = overmind();
  const { path } = state.view.MessageLog;
  let messages = [];
  if (path) {
    let document = _.get(state, path) || {};
    let jobs = _.get(document, `_meta.services.target.jobs`);
    Object.values(jobs || {}).forEach(({ updates }) => {
      messages.push(
        ...Object.values(updates || {})
          .filter((obj) => obj.information || obj.meta)
          .map((obj) => ({
            text: obj.information || obj.meta,
            type: obj.type,
            time: (moment(obj.time, "X").year() > 2000
              ? moment(obj.time, "X").add(4, "hours")
              : moment(obj.time)
            ).fromNow(),
          }))
          .map((obj) => {
            if (obj.text === "Runner started") obj.text = "Document received";

            if (obj.text === "Runner finshed")
              obj.text = "Document processing complete";

            if (/^Target returned success/.test(obj.text)) {
              obj.text = "Target extraction completed successfully";
              obj.color = "green";
            }

            if (/^Job result loaded/.test(obj.text)) obj.text = false;

            if (/^Recognized Type/.test(obj.text))
              obj.text = `Document recognized by Target as ${obj.type}`;

            if (/^Signed resource/.test(obj.text))
              obj.text = "Document signature applied";

            if (/^Linking doctype/.test(obj.text)) obj.text = false;

            if (/^helper: linking/.test(obj.text)) obj.text = false;

            if (/^Completed all helper/.test(obj.text)) obj.text = false;

            if (/^File format was not/.test(obj.text)) {
              obj.text = "File format was not recognized";
              obj.color = "red";
            }

            return obj;
          })
          .filter(({ text }) => text)
      );
    });
  }

  return (
    <div>
      <Header as="h4">Message Log</Header>
      {(messages || []).map((msg) => (
        <Message
          info
          color={msg.color}
          css={{ display: "flex", flexDirection: "row" }}
        >
          <p css={{ flex: "1" }}>{msg.text}</p>
          <p>{msg.time}</p>
        </Message>
      ))}
    </div>
  );
}

export default MessageLog;
