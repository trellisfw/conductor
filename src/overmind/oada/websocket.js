const Promise = require("bluebird");
const urlLib = require("url");
const uuid = require("uuid/v4");
Promise.config({ warnings: false });

export default function websocket(url) {
  //Create the message queue
  var messages = [];
  //Create the socket
  url = url.replace("https://", "wss://").replace("http://", "ws://");
  console.log("Creating WebSocket for", url);
  var socket;
  var connected = false;
  var httpCallbacks = {};
  var watchCallbacks = {};

  function sendMessages() {
    if (!connected) return;
    messages.forEach((message) => {
      socket.send(JSON.stringify(message));
    });
    messages = [];
  }
  return new Promise((resolve, reject) => {
    console.log("Calling WebSocket(url)");
    socket = new WebSocket(url);
    socket.onopen = function (event) {
      console.log("We are connected via websocket");
      connected = true;
      sendMessages();
      resolve(socket);
    };
    socket.onclose = function (event) {
      console.log("Websocket closed.");
    };
    socket.onmessage = function (event) {
      var response = JSON.parse(event.data);
      //Look for id in httpCallbacks
      if (response.requestId) {
        if (httpCallbacks[response.requestId]) {
          //Resolve Promise
          if (response.status >= 200 && response.status < 300) {
            httpCallbacks[response.requestId].resolve(response);
          } else {
            //Create error like axios
            let err = new Error(
              "Request failed with status code " + response.status
            );
            err.request = httpCallbacks[response.requestId].request;
            err.response = {
              status: response.status,
              statusText: response.statusText,
              headers: response.headers,
              data: response.data,
            };
            err.originalStack =
              httpCallbacks[response.requestId].request.requestStack;
            httpCallbacks[response.requestId].reject(err);
          }
          delete httpCallbacks[response.requestId];
        } else if (watchCallbacks[response.requestId]) {
          if (watchCallbacks[response.requestId].resolve) {
            if (response.status === 200) {
              //if (response.status === 'success') {
              //Successfully setup websocket, resolve promise
              watchCallbacks[response.requestId].resolve(response);
            } else {
              //error(watchCallbacks[response.requestId].request, response);
              let err = new Error(
                "Request failed with status code " + response.status
              );
              err.response = response;
              err.request = watchCallbacks[response.requestId].request;
              watchCallbacks[response.requestId].reject(err);
            }
            //Remove resolve and reject so we process change as a signal next time
            delete watchCallbacks[response.requestId]["resolve"];
            delete watchCallbacks[response.requestId]["reject"];
          } else {
            if (watchCallbacks[response.requestId].callback === null)
              throw new Error(
                "The given watch function has an undefined callback:",
                watchCallbacks[response.requestId]
              );
            watchCallbacks[response.requestId].callback(response);
          }
        }
      }
    };
  }).then(() => {
    console.log("Returning websocket obj");
    function _http(request) {
      //Do a HTTP request
      return new Promise((resolve, reject) => {
        let urlObj = urlLib.parse(request.url);
        let message = {
          requestId: uuid(),
          method: request.method.toLowerCase(),
          path: urlObj.path,
          data: request.data,
          headers: Object.entries(request.headers)
            .map(([key, value]) => {
              return { [key.toLowerCase()]: value };
            })
            .reduce((a, b) => {
              return { ...a, ...b };
            }),
        };
        messages.push(message);
        httpCallbacks[message.requestId] = {
          request: request,
          resolve: resolve,
          reject: reject,
        };
        sendMessages();
      });
    }

    function _unwatch(request, callback) {
      //Unwatch for changes on requested resource and trigger provided signal
      let urlObj = urlLib.parse(request.url);
      return new Promise((resolve, reject) => {
        let message = {
          requestId: uuid(),
          method: "unwatch",
          path: urlObj.path,
          headers: Object.entries(request.headers)
            .map(([key, value]) => {
              return { [key.toLowerCase()]: value };
            })
            .reduce((a, b) => {
              return { ...a, ...b };
            }),
        };
        messages.push(message);
        watchCallbacks[message.requestId] = {
          request,
          resolve,
          reject,
          callback,
        };
        sendMessages();
      });
    }

    function _watch(request, callback) {
      //Watch for changes on requested resource and trigger provided signal
      let urlObj = urlLib.parse(request.url);
      return new Promise((resolve, reject) => {
        let message = {
          requestId: uuid(),
          method: "watch",
          path: urlObj.path,
          headers: Object.entries(request.headers)
            .map(([key, value]) => {
              return { [key.toLowerCase()]: value };
            })
            .reduce((a, b) => {
              return { ...a, ...b };
            }),
        };
        messages.push(message);
        watchCallbacks[message.requestId] = {
          request,
          resolve,
          reject,
          callback,
        };
        sendMessages();
      });
    }

    function _close() {
      //TODO reject all callbacks that have not resolved
      //Clear everything
      messages = [];
      httpCallbacks = {};
      watchCallbacks = {};
      //Close socket
      socket.close();
    }

    return {
      url,
      http: _http,
      close: _close,
      watch: _watch,
      unwatch: _unwatch,
    };
  });
}
