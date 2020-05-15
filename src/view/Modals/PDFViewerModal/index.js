import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Document, Page } from 'react-pdf';

import overmind from '../../../overmind'
import _ from 'lodash'
import { Modal } from 'semantic-ui-react'

function PDFViewerModal(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.PDFViewerModal;
  const myState = state.view.Modals.PDFViewerModal;
  const { pageNumber, numPages } = myState;
  return (
    <Modal open={myState.open} onClose={myActions.close}>
      <Modal.Content>
        <div css={css`
            min-height: 350px;
            &  .pdfPage {
              display: flex;
              justify-content: center;
            }
          `}>
          <Document
            file={
              {
                url: myState.url,
                httpHeaders: myState.headers
              }
            }
            onLoadSuccess={myActions.onLoadSuccess}>
            <Page className={'pdfPage'} pageNumber={pageNumber} />
          </Document>
          <div>
          <p>
            Page {pageNumber || (numPages ? 1 : '--')} of {numPages || '--'}
          </p>
          <button
            type="button"
            disabled={pageNumber <= 1}
            onClick={myActions.previousPage}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            onClick={myActions.nextPage}
          >
            Next
          </button>
        </div>
        </div>
      </Modal.Content>
    </Modal>
  );
}

export default PDFViewerModal
