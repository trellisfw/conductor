import React from 'react'

import { hashJSON } from '@trellisfw/signatures'

import overmind from '../overmind'

function OADAMask ({ masked, original }) {
  const { actions } = overmind()
  const { hash, link } = masked

  // Check that hash matches the original
  // TODO: I guess this code shouldn't be in a view?
  if (!original) {
    ({ data: original } = await actions.oada.get(link))
  }
  const valid = hash === hashJSON(original)

  const text = valid ? 'Masked, Valid' : 'Masked, Invalid'

  return (
    <div>
      {/* TODO: Add mask icon? */}
      {/* TODO: Show hash in GUI? */}
      <a style={{ color: valid ? 'green' : 'red' }} href={link}>
        {text}
      </a>
    </div>
  )
}

export default OADAMask
