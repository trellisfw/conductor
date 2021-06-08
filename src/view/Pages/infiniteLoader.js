import _ from 'lodash'
let loaders = {};

function wrapper(overmindLoadFunc) {
  let loading = {}
  let loadBatch = {};
  let omLoadFunc = overmindLoadFunc;

  function loadRows() {
//    const docKeys = _.keys(loadBatch);
    const documents = _.clone(loadBatch);
    loadBatch = {};
    console.log('loading rows', documents);
    if (omLoadFunc) {
      return omLoadFunc(documents);
//      return omLoadFunc(docKeys);
    } else {
      if (omLoadFunc == null) {
        console.warn('No overmind action provided to infiniteLoader')
      } else {
        console.warn('Overmind action ', omLoadFunc, ' not found.')
      }
    }
  }
  let debouncedLoadRows = _.debounce(loadRows, 300, {maxWait: 1000});
  function getRow(row) {
    //Check if loaded
//    if (_.isEmpty(_.omit(row, 'docKey'))) {
    if (!row.loaded) {
      //Not loaded, load it
      if (loading[row.docKey] != true) {
        loading[row.docKey] = true
        loadBatch[row.docKey] = row;
        debouncedLoadRows()
      }
    }
  }
  function resetLoading(index) {
    if (index == null) {
      loading = {}
    }
  }
  return  {
    getRow,
    resetLoading
  }
}

export default function infiniteLoader(id, overmindLoadFunc) {
  if (loaders[id] != null) return loaders[id];
  loaders[id] = wrapper(overmindLoadFunc);
  return loaders[id];
}
