import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { Document, Page } from 'react-pdf';

import overmind from '../../../overmind'
import _ from 'lodash'
import { Modal, Icon, Button } from 'semantic-ui-react'

function PDFViewerModal(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.PDFViewerModal;
  const myState = state.view.Modals.PDFViewerModal;
  let { pageNumber, numPages } = myState;
  pageNumber = pageNumber || 1;
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
          <Button
            onClick={myActions.close}
            >
            <Button.Content visible>
              <Icon name='close' />
            </Button.Content>
          </Button>
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
      </Modal.Content>
    </Modal>
  );
}

export default PDFViewerModal
