import { IConfig } from 'overmind'

import { createHook } from 'overmind-react'

import { namespaced } from 'overmind/config'

import app from './app'
import * as oada from './oada'
import * as view from './view'
import * as login from './login'
import * as examples from './examples'
import * as partners from './partners'
import * as rules from './rules'

export const config = namespaced({
  app: app('app'),
  oada,
  view,
  login,
  examples,
  partners,
  rules,
})

declare module 'overmind' {
  interface Config extends IConfig<typeof config> {}
}

export default createHook<typeof config>()
