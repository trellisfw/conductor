var _ = require('lodash');
var axios = require('axios');
var Promise = require('bluebird');
const argv = require('minimist')(process.argv.slice(2));

const token = argv.t || process.env.TOKEN || 'god'; // this is one of the Trellis dummy tokens.  Create your own if you aren't running trellis in dev mode
const url = argv.u || process.env.URL || 'https://localhost';
console.log('Using url '+url+', token ', token);

console.log('Requesting /bookmarks/trellisfw/documents...');
return axios.request({
  url: '/bookmarks/trellisfw/documents',
  baseURL: url,
  method: 'get',
  headers: {
    Authorization: 'Bearer '+token,
  }
}).then(function (response) {
    let keys = _.filter(Object.keys(_.get(response, 'data')), key=>(_.startsWith(key, '_')===false));
    // handle success
    console.log(keys.length+'', 'documents to delete');
    return Promise.map(keys, (key) => {
      console.log('Deleting document', key);
      return axios.request({
        url: `/bookmarks/trellisfw/documents/${key}`,
        baseURL: url,
        method: 'delete',
        headers: {
          Authorization: 'Bearer '+token,
        }
      }).catch((err) => {
        console.log('Unable to delete document', key, err);
      })
    }, {concurrency: 5})
  })
  .catch(function (error) {
    // handle error
    console.log('ERROR: ', error);
  })
  .then(function () {
    // always executed
  });
