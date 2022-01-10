import { configureStore } from '@reduxjs/toolkit';

import reducers from './reducers';
import initialState from './initial';
import socketMiddleware from './socket';

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(socketMiddleware),
  preloadedState: initialState,
})

export default store;