var _ = require('lodash');
var axios = require('axios');
var Promise = require('bluebird');
const argv = require('minimist')(process.argv.slice(2));

const token = argv.t || process.env.TOKEN || 'god'; // this is one of the Trellis dummy tokens.  Create your own if you aren't running trellis in dev mode
const url = argv.u || process.env.URL || 'https://localhost';
console.log('Using url '+url+', token ', token);

console.log('Requesting /bookmarks/trellisfw/documents...');
async function main() {
  let r0 = await axios.request({
    url: '/bookmarks/trellisfw/documents',
    baseURL: url,
    method: 'get',
    headers: {
      Authorization: 'Bearer '+token,
    }
  }).catch(function (error) {
    // handle error
    console.log('ERROR: ', error);
  })

  let r1 = await axios.request({
      url: '/bookmarks/trellisfw/trading-partners/601af61b53b391000e4a7a3e/bookmarks/trellisfw/documents',
      baseURL: url,
      method: 'get',
      headers: {
        Authorization: 'Bearer '+token,
      }
  }).catch(function (error) {
    // handle error
    console.log('ERROR: ', error);
  })

  let r2 = await axios.request({
    url: '/bookmarks/trellisfw/trading-partners/601af61b53b391000e4a7a3e/shared/trellisfw/documents',
    baseURL: url,
    method: 'get',
    headers: {
      Authorization: 'Bearer '+token,
    }
  }).catch(function (error) {
    // handle error
    console.log('ERROR: ', error);
  })

  let r3 = await axios.request({
      url: '/bookmarks/trellisfw/trading-partners/601af61b53b391000e4a7a3e/bookmarks/trellisfw/cois',
      baseURL: url,
      method: 'get',
      headers: {
        Authorization: 'Bearer '+token,
      }
  }).catch(function (error) {
    // handle error
    console.log('ERROR: ', error);
  })

  let r4 = await axios.request({
      url: '/bookmarks/trellisfw/trading-partners/601af61b53b391000e4a7a3e/shared/trellisfw/cois',
      baseURL: url,
      method: 'get',
      headers: {
        Authorization: 'Bearer '+token,
      }
  }).catch(function (error) {
    // handle error
    console.log('ERROR: ', error);
  })

  /*
  let r5 = await axios.request({
    url: '/bookmarks/trellisfw/cois',
    baseURL: url,
    method: 'get',
    headers: {
      Authorization: 'Bearer '+token,
    }
  }).catch(function (error) {
    // handle error
    console.log('ERROR: ', error);
  })
  */

  await axios.request({
    url: `/bookmarks/services/fl-sync/businesses/603e98525feb57000f81fc50/documents`,
    baseURL: url,
    method: 'delete',
    headers: {
      Authorization: 'Bearer '+token,
    }
  })

  let paths = [
    '/bookmarks/trellisfw/documents',
    '/bookmarks/trellisfw/trading-partners/601af61b53b391000e4a7a3e/bookmarks/trellisfw/documents',
    '/bookmarks/trellisfw/trading-partners/601af61b53b391000e4a7a3e/shared/trellisfw/documents',
    '/bookmarks/trellisfw/trading-partners/601af61b53b391000e4a7a3e/bookmarks/trellisfw/cois',
    '/bookmarks/trellisfw/trading-partners/601af61b53b391000e4a7a3e/shared/trellisfw/cois',
//    '/bookmarks/trellisfw/cois',
  ]


  return Promise.each([r0, r1, r2, r3, r4], (response, i) => {
    let keys = _.filter(Object.keys(_.get(response, 'data') || {}), key=>(_.startsWith(key, '_')===false));
    // handle success
    console.log(keys.length+'', 'documents to delete');
    return Promise.map(keys, (key) => {
      console.log('Deleting document', `${paths[i]}/${key}`);
      return axios.request({
        url: `${paths[i]}/${key}`,
        baseURL: url,
        method: 'delete',
        headers: {
          Authorization: 'Bearer '+token,
        }
      }).catch((err) => {
        console.log('Unable to delete document', key, err);
      })
    }, {concurrency: 25})
  })
    
}

main()
