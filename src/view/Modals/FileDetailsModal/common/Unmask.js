import React from 'react'

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import { Icon, Table, Button} from 'semantic-ui-react'
import overmind from '../../../../overmind'

function Unmask (props) {
  const { actions } = overmind();
  const myActions = actions.view.Modals.FileDetailsModal;
  const { document } = props;
  if (!document.unmask) return null;
  const resourceId = (document.unmask) ? document.unmask._id : null;
  return (
    <Table.Row>
      <Table.Cell collapsing css={{fontWeight: 'bold'}}>
        Unmask
      </Table.Cell>
      <Table.Cell>
        <Button onClick={()=>{myActions.showDocument({resourceId})}}>View Original</Button>
      </Table.Cell>
    </Table.Row>
  )
}

export default Unmask
