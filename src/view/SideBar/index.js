import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import iconFiles from './files.svg';
import iconBuisness from './buisness.svg';
import iconConnections from './connections.svg';
import overmind from '../../overmind'

const activeSideSelection = {
  'img': {
    filter: 'invert(22%) sepia(76%) saturate(6476%) hue-rotate(201deg) brightness(92%) contrast(100%)',
    opacity: 0.6
  },
  'div': {
    color: '#0066CB'
  }
}

function SideSection(props) {
  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 125px;
        width: 150px;
        cursor: pointer;
        border-bottom: 1px solid #979797;
        &:hover {
          ${activeSideSelection}
        }
        &.selected {
          ${activeSideSelection}
        }
        & img {
          opacity: 0.41
        }
        & div {
          opacity: 0.84
        }
      `}
      className={props.selected ? 'selected' : null}
      >
      <img
        css={{
          height: '41px', paddingBottom: '7px'
        }}
        src={props.icon}
        fill={'#666'}
      />
      <div>{props.children}</div>
    </div>
  );
}

function SideBar() {
  const { state } = overmind();
  const selectedPage = state.view.Pages.selectedPage;
  return (
    <div css={{
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #979797'
    }}>
      <SideSection selected={(selectedPage == 'Files')} icon={iconFiles}>{'Data'}</SideSection>
      <SideSection selected={(selectedPage == 'Trading Partners')} icon={iconBuisness}>{'Trading Partners'}</SideSection>
      <SideSection selected={(selectedPage == 'Connections')} icon={iconConnections}>{'Sync Rules'}</SideSection>
    </div>
  );
}

export default SideBar;
