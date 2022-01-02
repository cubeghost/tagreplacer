import { configureStore } from '@reduxjs/toolkit';

import reducers from './reducers';
import initialState from './initial';

const testMiddleware = () => next => action => {
  return next(action);
};

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) => [...getDefaultMiddleware(), testMiddleware],
  preloadedState: initialState,
})

export default store;