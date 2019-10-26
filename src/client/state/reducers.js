import { assign } from 'lodash';
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
      return assign({}, state, {
        username: action.response.name,
        blogs: action.response.blogs,
      });
    case actionTypes.TUMBLR_FIND_TAGS:
      return assign({}, state, {
        ...action.response
      });
    case actionTypes.TUMBLR_CLEAR_POSTS:
      return assign({}, state, {
        posts: initialState.tumblr.posts,
        queued: initialState.tumblr.queued,
        drafts: initialState.tumblr.drafts
      });
    default:
      return state;
  }
};

const formReducer = (state = initialState.form, action) => {
  switch (action.type) {
    case actionTypes.SET_FORM_VALUE:
      return assign({}, state, {
        [action.key]: action.value
      });
    case actionTypes.RESET_FORM_VALUE:
      return assign({}, state, {
        [action.key]: initialState.form[action.key]
      });
    default:
      return state;
  }
};

const optionsReducer = (state = initialState.options, action) => {
  switch (action.type) {
    case actionTypes.SET_OPTION:
      return assign({}, state, {
        [action.key]: action.value
      });
    case actionTypes.RESET_OPTIONS:
      return assign({}, initialState.options);
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
