import _ from 'lodash';
import { combineReducers } from 'redux';

import initialState from './initial';
import { actionTypes } from './actions';

/**
tumblr: {
  username: undefined,
  blogs: [],
  posts: [],
  queued: [],
  drafts: [],
},
form: {
  blog: undefined,
  find: [],
  replace: [],
},
options: {
  includeQueue: false,
  includeDrafts: false,
  caseSensitive: false,
},
errors: [],
 */

const tumblrReducer = (state = initialState.tumblr, action) => {
  switch (action.type) {
    case actionTypes.TUMBLR_GET_USER:
      return _.assign({}, state, {
        username: action.response.name,
        blogs: action.response.blogs,
      });
    default:
      return state;
  }
};

const formReducer = (state = initialState.form, action) => {
  return state;
};

const optionsReducer = (state = initialState.options, action) => {
  return state;
};

const errorsReducer = (state = initialState.errors, action) => {
  return state;
};

const loadingReducer = (state = initialState.loading, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return action.loading;
    default:
      return state;
  }
};

const reducers = combineReducers({
  tumblr: tumblrReducer,
  form: formReducer,
  options: optionsReducer,
  errors: errorsReducer,
  loading: loadingReducer,
});

export default reducers;
