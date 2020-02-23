import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../overmind'
import { Input, Button, Form } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import config from '../config';

function Login() {
  const { state, actions } = overmind();
  const myState = state.login;
  const myActions = actions.login;
  return (
    <div css={css`
      height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background: url(./skins/${config.skin.name}/${config.skin.config.loginBackground}) no-repeat center center fixed;
      background-size: cover;
    `}>
      <div css={css`
        width: 250px;
        display: flex;
        flex-direction: column;
      `}>
        <img css={{
          height: config.skin.config.logo.height,
          marginBottom: 25
        }} src={`/skins/${config.skin.name}/${config.skin.config.logo.src}`} alt="logo" />
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
    </div>
  );
}

export default Login;
