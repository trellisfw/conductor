import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import { Document, Page } from 'react-pdf';

import overmind from '../../../overmind'
import _ from 'lodash'
import { Modal, Icon, Button } from 'semantic-ui-react'
import {useMemo} from 'react';

function PDFViewerModal(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.PDFViewerModal;
  const myState = state.view.Modals.PDFViewerModal;
  let { pageNumber, numPages, url, headers } = myState;
  pageNumber = pageNumber || 1;

  const file = useMemo(
    () => ({ url, httpHeaders: headers}),
    [url]
  );

  return (
    <Modal open={myState.open} onClose={myActions.close}>
      <Modal.Content>
        <div css={css`
            min-height: 350px;
          `}>
          <div css={{display: 'flex', justifyContent: 'space-between'}}>
            <Button
              onClick={myActions.download}
              icon="download" />
            <Button
              onClick={myActions.close}
              icon="close" />
          </div>
          <div css={css`
            display: flex;
            justify-content: center;
          `}>
            <Document
              externalLinkTarget={"_blank"}
              file={file}
              onLoadSuccess={myActions.onLoadSuccess}>
              <Page pageNumber={pageNumber} />
            </Document>
          </div>
          <div css={{display: 'flex', justifyContent: 'space-between'}}>
            <div>
              Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
            </div>
            <div>
              <Button
                disabled={pageNumber <= 1}
                onClick={myActions.previousPage}>
                Previous
              </Button>
              <Button
                disabled={pageNumber >= numPages}
                onClick={myActions.nextPage}>
                Next
              </Button>
            </div>
          </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}

export default PDFViewerModal
