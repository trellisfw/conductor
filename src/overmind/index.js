import { createHook } from "overmind-react"

import { namespaced } from 'overmind/config'

import app from './app'
import * as oada from './oada'
import * as view from './view'

export const config = namespaced({
  app: app('app'),
  oada,
  view
})


export default createHook()
