import { AsyncAction } from 'overmind'

import axios from 'axios'

export const get: AsyncAction<string> = async (
  { state, actions },
  url: string
) => {
  let data
  try {
    ;({ data } = await axios.get(url))
  } catch {
    try {
      ;({ data } = await actions.oada.get(url))
    } catch {}
  }
  state.urls[url] = data
}
