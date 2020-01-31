import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import { pdfjs, Document, Page } from 'react-pdf';

import overmind from '../../../overmind'
import _ from 'lodash'
import { Modal } from 'semantic-ui-react'

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PDFViewerModal(props) {
  const { actions, state } = overmind();
  const myActions = actions.view.Modals.PDFViewerModal;
  const myState = state.view.Modals.PDFViewerModal;
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
            onLoadSuccess={({numPages}) => {}}>
            <Page className={'pdfPage'} pageNumber={1} />
          </Document>
        </div>
      </Modal.Content>
    </Modal>
  );
}

export default PDFViewerModal
