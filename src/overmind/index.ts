import { IConfig } from 'overmind'

import { createHook } from 'overmind-react'

import { namespaced } from 'overmind/config'

import app from './app'
import * as oadaHelper from './oada'
import * as view from './view'
import * as login from './login'
import * as examples from './examples'
import * as partners from './partners'
import * as rules from './rules'

const oadaCacheOvermind = require('@oada/oada-cache-overmind').default
const oada = oadaCacheOvermind('oada');

export const config = namespaced({
  app: app('app'),
  oada,
  oadaHelper,
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
