import websocket from './websocket';
import _ from 'lodash'
var myWebsocket = null;

export default {
  websocket: {
    connect(url) {
      //Connect to OADA with this url
      return websocket(url).then((ws) => {
        myWebsocket = ws;
        return myWebsocket;
      })
    },
    watch(request, callback) {
      return myWebsocket.watch(request, callback)
    },
    http(request) {
      return myWebsocket.http(request).catch((err) => {
        if (err.response && err.response.status) {
          if (err.response.status == 404) {
            console.log("HTTP 404:", _.get(err, 'response.headers.content-location'));
          } else if (err.response.status == 403) {
            console.log("HTTP 403:", _.get(err, 'response.headers.content-location'));
          } else if (err.response.status == 401) {
            console.warn("HTTP 401:", _.get(err, 'request.url'));
          } else {
            console.warn('HTTP Error:');
            console.warn(JSON.stringify(err, null, 2))
          }
        } else {
          console.warn('HTTP Error no response obj:', err)
          console.warn(JSON.stringify(err, null, 2))
        }
        throw err;
      });
    },
    close() {
      if (myWebsocket) {
        console.log('Closing web socket...');
        return myWebsocket.close();
      }
      console.log('WARNING: tried to close a null websocket!');
    }
  }
}
