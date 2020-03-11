import React from 'react'

import { hashJSON } from '@trellisfw/signatures'

import overmind from '../overmind'

enum Validity {
  Invalid = 0,
  Valid = 1,
  Unknown,
}

type Masked = {
  hash: string,
  link: string
}
function OADAMask ({ masked } : {masked: Masked}) {
  const { actions, state } = overmind()
  const { hash, link } = masked

  // Check that hash matches the original
  let original = state.urls[link]
  // TODO: I guess this code shouldn't be in a view?
  if (!original) {
    actions.urls.get(link)
  }

  const valid: Validity = original ? +(hash === hashJSON(original).hash) : Validity.Unknown

  return (
    <div>
      {/* TODO: Add mask icon? */}
      {/* TODO: Show hash in GUI? */}
      <a style={{ color: valid === Validity.Valid ? 'green' : 'red' }} href={link}>
        {text(valid)}
      </a>
    </div>
  )
}

function text(valid: Validity): string {
  switch(valid) {
    case Validity.Valid:
      return 'Masked, Valid'
    case Validity.Invalid:
      return 'Masked, Invalid'
    case Validity.Unknown:
      return 'Masked, Unvalidated'
  }
}

export default OADAMask
