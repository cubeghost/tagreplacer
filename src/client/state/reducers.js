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
  switch (action.type) {
    case actionTypes.SET_FORM_VALUE:
      return _.assign({}, state, {
        [action.key]: action.value
      });
    default:
      return state;
  }
};

const optionsReducer = (state = initialState.options, action) => {
  switch (action.type) {
    case actionTypes.SET_OPTION:
      return _.assign({}, state, {
        [action.key]: action.value
      });
    case actionTypes.RESET_OPTIONS:
      return _.assign({}, initialState.options);
    default:
      return state;
  }
};

const errorsReducer = (state = initialState.errors, action) => {
  switch (action.type) {
    case actionTypes.ADD_ERROR:
      return [...state, { ...action.response }];
    default:
      return state;
  }
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
