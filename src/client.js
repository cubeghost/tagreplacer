import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import initialState from './client/state/initial';
import configureStore from './client/state/store';

import App from './client/App';

import './scss/style.scss';

const store = configureStore(initialState);

const ROOT = (
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>
);

ReactDOM.render(ROOT, document.querySelector('#react-root'));
