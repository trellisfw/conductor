import websocket from './websocket';

var myWebsocket = null;

export default {
  websocket: {
    connect(url) {
      //Connect to OADA with this url
      return websocket(url).then((ws) => {
        myWebsocket = ws;
      })
    },
    watch(request, callback) {
      return myWebsocket.watch(request, callback)
    },
    http(request, callback) {
      return myWebsocket.http(request, callback)
    }
  }
}
