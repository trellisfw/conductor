process.env.NODE_TLS_REJECT_UNAUTHORIZED=0
var _ = require('lodash');
var axios = require('axios');
var Promise = require('bluebird');
const argv = require('minimist')(process.argv.slice(2));
var oada = require('@oada/oada-cache');
let shares = require('./shares.json');

let tree = {
  bookmarks: {
    _type: 'application/vnd.oada.bookmarks.1+json',
    services: {
      _type: 'application/vnd.oada.services.1+json',
      ainz: {
        _type: 'application/vnd.oada.service.1+json',
        _rev: 0,
        shares: {
          '*': {
            _type: 'application/vnd.oada.ainz.rule.1+json',
            _rev: 0,
          }
        }
      }
    }
  }
}

const token = argv.t || process.env.TOKEN || 'god'; // this is one of the Trellis dummy tokens.  Create your own if you aren't running trellis in dev mode
const url = argv.u || process.env.URL || process.env.DOMAIN || 'https://localhost';
console.log('Using url '+url+', token ', token);

return oada.connect({
  domain: url,
  token,
  cache: false
}).then((CONNECTION) => {
  return Promise.each(Object.keys(shares), (key) => {
    return CONNECTION.put({
      path: `/bookmarks/services/ainz/shares/${key}`,
      data: shares[key],
      tree
    })
  })
}).then(() => {
  return process.exit()
})
