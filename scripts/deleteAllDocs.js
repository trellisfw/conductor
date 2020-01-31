var _ = require('lodash');
var axios = require('axios');
var Promise = require('bluebird');

const token = 'god';
const url = 'https://smithfield.trellis.one';
//const url = 'https://localhost';

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
    console.log(error);
  })
  .then(function () {
    // always executed
  });
