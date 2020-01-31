import React from 'react';
import ReactDOM from 'react-dom';

import { createOvermind } from "overmind";
import { Provider } from "overmind-react";
import { config } from './overmind'

import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const app = createOvermind(config,
{
    devtools: true,
});

ReactDOM.render(
  <Provider value={app}>
    <App />
  </Provider>
, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
