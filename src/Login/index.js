import React from 'react';

/** @jsx jsx */
import { jsx, css } from '@emotion/core'

import overmind from '../overmind'
import { Input, Button, Form } from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'
import logo from './smithfield.svg'

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
      background: url(./loginBg.jpg) no-repeat center center fixed;
      background-size: cover;
    `}>
      <div css={css`
        width: 250px;
        display: flex;
        flex-direction: column;
      `}>
        <img css={{
          height: 50,
          marginBottom: 25
        }} src={logo} alt="logo" />
        <Form css={css`
          display: flex;
          flex-direction: column;
        `} onSubmit={myActions.login}>
          <Input placeholder='Email...' value={myState.email} onChange={(evt, data) => myActions.emailChange(data)} />
          <Input type={'password'} style={{marginTop: 7}} placeholder='Password...' onChange={(evt, data) => myActions.passwordChange(data)} />
          <Button
            style={{marginTop: 7}} primary
            onClick={myActions.login}
            loading={myState.loading}
            disabled={myState.loading}>
            Sign In
          </Button>
        </Form>
        {
          (myState.incorrect) ?
            <div css={{textAlign: 'center', marginTop: 4, color: 'red'}}>{'Your email or password is incorrect.'}</div>
          :
            <div css={{height: 19, marginTop: 4}}></div>
        }
      </div>
    </div>
  );
}

export default Login;
