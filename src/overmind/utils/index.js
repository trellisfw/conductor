import md5 from 'md5'

export default {
  objFromObjArr(arr) {
    let obj = {}
    arr.forEach((item) => {
      item.key = md5(JSON.stringify(item));
      obj[item.key] = item;
    })
    return obj
  },

  objFromStrArr(arr) {
    let obj = {}
    arr.forEach((item) => {
      let o = {name: item};
      o.key = md5(JSON.stringify(o));
      obj[o.key] = o;
    })
    return obj
  }
}
