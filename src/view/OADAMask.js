import React from 'react'

import { hashJSON } from '@trellisfw/signatures'

function OADAMask ({ masked, orig }) {
  const { hash, link } = masked

  const valid = hash === hashJSON(orig)

  const style = {
    paddingLeft: '3px',
    paddingRight: '3px',
    marginLeft: '3px',
    marginRight: '3px',
    color: valid ? 'green' : 'red'
  }

  const text = valid ? 'Masked, Valid' : 'Masked, Invalid'

  return (
    <div>
      {/* TODO: Add mask icon? */}
      <span style={style}>
        {/* TODO: Show hash in GUI? */}
        <a style={{ color: valid ? 'green' : 'red' }} href={link}>
          {text}
        </a>
      </span>
    </div>
  )
}

export default OADAMask
