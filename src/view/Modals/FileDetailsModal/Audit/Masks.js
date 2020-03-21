import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table, Button} from 'semantic-ui-react'
import overmind from '../../../../overmind'
import _ from 'lodash'
import Chip from '@material-ui/core/Chip'

function Masks (props) {
  const { actions } = overmind();
  const myActions = actions.view.Modals.FileDetailsModal;
  const { document } = props;
  if (!document.masks) return null;
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Masked Copies
      </Table.Cell>
      <Table.Cell css={css`
          .MuiChip-root {
            font-family: inherit;
            font-size: 14px;
            line-height: 16px;
            margin-left: 3px;
            margin-top: 3px;
          }
          .MuiChip-root:first-of-type {
            margin-left: 0px;
          }
        `}>
        {
          _.map(document.masks, (d, idx) => {
            let resourceId = d._id;
            return (
              <Chip key={idx} label={'Masked Copy'} onClick={() => myActions.showDocument({resourceId})} />
            )
          })
        }
      </Table.Cell>
    </Table.Row>
  )
}

export default Masks
