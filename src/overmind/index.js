import { createHook } from "overmind-react"

import { namespaced } from 'overmind/config'

import app from './app'
import * as oada from './oada'
import * as view from './view'
import * as login from './login'

export const config = namespaced({
  app: app('app'),
  oada,
  view,
  login
})


export default createHook()
