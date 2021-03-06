import React from "react";

/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx, css } from "@emotion/core";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

import MessageLog from "../../Widgets/MessageLog";

import { Document, Page } from "react-pdf/dist/umd/entry.webpack";

import overmind from "../../../overmind";
import moment from "moment";
import _ from "lodash";
import { Header, Message, Modal, Icon, Button } from "semantic-ui-react";
import { useMemo } from "react";

function PDFViewerModal(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.PDFViewerModal;
  const myState = state.view.Modals.PDFViewerModal;
  const { pageNumber = 1, numPages, url, headers } = myState;

  const file = useMemo(() => ({ url, httpHeaders: headers }), [url]);

console.dir(file)

  return (
    <Modal open={myState.open} onClose={myActions.close}>
      <Modal.Content>
        <div
          css={css`
            min-height: 350px;
          `}
        >
          <div css={{ display: "flex", justifyContent: "space-between" }}>
            <Button onClick={myActions.download} icon="download" />
            <Button onClick={myActions.close} icon="close" />
          </div>
          <div
            css={css`
              display: flex;
              justify-content: center;
            `}
          >
            <Document
              externalLinkTarget={"_blank"}
              file={file}
              onLoadSuccess={myActions.onLoadSuccess}
            >
              <Page pageNumber={pageNumber} />
            </Document>
          </div>
          <div css={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              Page {pageNumber || (numPages ? 1 : "--")} of {numPages || "--"}
            </div>
            <div>
              <Button
                disabled={pageNumber <= 1}
                onClick={myActions.previousPage}
              >
                Previous
              </Button>
              <Button
                disabled={pageNumber >= numPages}
                onClick={myActions.nextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
        <MessageLog />
      </Modal.Content>
    </Modal>
  );
}

export default PDFViewerModal;
