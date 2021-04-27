import _ from 'lodash'
let loaders = {};

function wrapper(overmindLoadFunc) {
  let loading = {}
  let loadBatch = {};
  let omLoadFunc = overmindLoadFunc;

  function loadRows() {
//    const documentKeys = _.keys(loadBatch);
    loadBatch = {};
    if (omLoadFunc) {
      return omLoadFunc(loadBatch);
//      return omLoadFunc(documentKeys);
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
    console.log("ROW", row);
    //Check if loaded
    if (_.isEmpty(_.omit(row, 'documentKey'))) {
      //Not loaded, load it
      if (loading[row.documentKey] != true) {
        loading[row.documentKey] = true
        loadBatch[row.documentKey] = {row};
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
