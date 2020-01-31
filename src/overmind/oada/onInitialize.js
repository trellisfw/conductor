import _ from 'lodash';
import Promise from 'bluebird';

export default function ({ state, actions, effects }, instance) {
  /*
    Connect to my OADA instance
  */
  return actions.oada.connect().then((result) => {
    //Create /trellisfw if it does not exist
    return actions.oada.doesResourceExist('/bookmarks/trellisfw').then((exists) => {
      if (!exists) {
        //Create /trellisfw
        return actions.oada.createAndPutResource({
          url: '/bookmarks/trellisfw',
          data: {}
        });
      }
      console.log('trellisfw exists', exists);
    }).then(() => {
      //Create /trellisfw/documents if it does not exist
      return actions.oada.doesResourceExist('/bookmarks/trellisfw/documents').then((exists) => {
        if (!exists) {
          //Create documents
          return actions.oada.createAndPutResource({
            url: '/bookmarks/trellisfw/documents',
            data: {},
            contentType: 'application/vnd.trellisfw.documents.1+json'}
          );
        }
        console.log('documents exists', exists);
      });
    })
  }).then(() => {
    //Watch for changes to /trellisfw/documents
    return actions.oada.watch({url: '/bookmarks/trellisfw/documents', actionName: 'oada.onDocumentsChange'}).then(() => {
      //Get all the documents ids in /trellisfw/documents
      return actions.oada.get('/bookmarks/trellisfw/documents').then((response) => {
        let docKeys = _.filter(Object.keys(response.data), key=>(_.startsWith(key, '_')===false));
        //Load each of the documents
        return Promise.map(docKeys, (key) => {
          //Load the documents
          return actions.oada.loadDocument(key);
        }, {concurrency: 5});
      })
    })
  })
}
