/** @jsx jsx */
import {json} from 'overmind'
import { jsx, css } from '@emotion/core'

import overmind from '../../../overmind'
import { Button, Dropdown, Accordion, Icon } from 'semantic-ui-react'
import _ from 'lodash';

function Mappings (props) {
  const {state, actions} = overmind();
  let myState = state.view.Modals.RulesModal.Mappings;
  let myActions = actions.view.Modals.RulesModal;

  return (
    <div
      css= {{
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
      }}>

      {Object.keys(myState).filter(key => myState[key].name ? true : false).map(key =>
        <Accordion key={key}>
          <Accordion.Title
            active={myState[key].active}
            onClick={() => myActions.clickedMapping({key})}
          >
            <Icon name='dropdown' />
            {myState[key].name}
          </Accordion.Title>
          <Accordion.Content
            active={myState[key].active}
          >
            {myState[key].partners.map(p => 
              <p key={key+p}>{p}</p>
            )}
          </Accordion.Content>
        </Accordion>
      )}
    </div>
  );
}

export default Mappings
