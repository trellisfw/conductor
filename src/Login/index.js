import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'
import _ from 'lodash'
import overmind from '../overmind'
import { Input, Button, Form, Dropdown } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import config from '../config';

function Login() {
  const { state, actions } = overmind();
  const appState = state.app;
  const myState = state.login;
  const myActions = actions.login;

  const bg = appState.skins[appState.skin].loginBackground;
  const logo = appState.skins[appState.skin].logo;
  return (
    <div css={css`
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: url(./skins/${appState.skin}/${bg}) no-repeat center center fixed;
      background-size: cover;
    `}>
      <div css={css`
        width: 250px;
        display: flex;
        flex-direction: column;
      `}>
        <img css={{
          height: logo.height,
          marginBottom: 25
        }} src={`/skins/${appState.skin}/${logo.src}`} alt="logo" />
        <Form css={css`
          display: flex;
          flex-direction: column;
        `} onSubmit={myActions.login}>
          <Input placeholder='Trellis Domain...' value={myState.domain} onChange={(evt, data) => myActions.domainChange(data)} />
          <Button
            style={{marginTop: 7}} primary
            loading={myState.loading}
            disabled={myState.loading}>
            Connect to Your Trellis
          </Button>
        </Form>
      </div>
      <a css={css`
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 1.2em;
        color: #FFFFFF;
        cursor: pointer;
      `} onClick={myActions.logout}
      >Logout</a>

      <div css={css`
        position: absolute;
        top: 5px;
        left: 5px;
      `}>
        <Dropdown icon={{name: 'bars', inverted: true, size: 'large'}} text=''>
          <Dropdown.Menu>
            {_.map(_.keys(state.app.skins), s =>
              <Dropdown.Item text={s} value={s} onClick={() => actions.app.skinChange(s)} />
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>


    </div>
  );
}

export default Login;
