import { IConfig } from 'overmind'

import { createHook } from 'overmind-react'

import { namespaced } from 'overmind/config'

import app from './app'
import * as oada from './oada'
import * as urls from './urls'
import * as view from './view'
import * as login from './login'
import * as rules from './rules'
import * as partners from './partners'

export const config = namespaced({
  app: app('app'),
  oada,
  urls,
  view,
  login,
  rules,
  partners,
})

declare module 'overmind' {
  interface Config extends IConfig<typeof config> {}
}

export default createHook<typeof config>()
