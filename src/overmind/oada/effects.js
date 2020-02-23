import websocket from './websocket';
import _ from 'lodash'
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
    http(request) {
      return myWebsocket.http(request).catch((err) => {
        if (err.response && err.response.status) {
          if (err.response.status == 404) {
            console.log("HTTP 404", _.get(err, 'response.headers.content-location'));
          } else if (err.response.status == 403) {
            console.log("HTTP 403", _.get(err, 'response.headers.content-location'));
          } else {
            console.log('HTTP Error: ', err);
          }
        } else {
          console.log('HTTP Error', err)
        }
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
