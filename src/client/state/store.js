import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import reducers from './reducers';

const ENABLE_REDUX_DEVTOOLS =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ &&
  process.env.NODE_ENV !== 'production';
const composeEnhancers = ENABLE_REDUX_DEVTOOLS
  ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  : compose;

export default function configureStore(initialState) {
  return createStore(
    reducers,
    initialState,
    composeEnhancers(applyMiddleware(thunk))
  );
}
