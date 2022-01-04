import { assign } from 'lodash';
import { combineReducers } from 'redux';
import get from 'lodash/get';

import initialState from './initial';
import {
  actionTypes,
  getUser,
  find,
  setFormValue,
  resetFormValue,
  setOption,
  resetOptions,
} from './actions';

const PRODUCTION = process.env.NODE_ENV === 'production';
const DEFAULT_BLOG = PRODUCTION ? undefined : process.env.TESTING_BLOG;

/**
tumblr: {
  username: undefined,
  blogs: [],
  find: [],
  posts: undefined,
  queued: undefined,
  drafts: undefined,
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

/** TODO we need to persist/cache the blogs list */
const tumblrReducer = (state = initialState.tumblr, action) => {
  switch (action.type) {
    case getUser.fulfilled.toString():
      return assign({}, state, {
        username: action.payload.name,
        blogs: action.payload.blogs,
      });
    case find.fulfilled.toString():
      return assign({}, state, {
        // ...action.response,
        find: action.meta.body.find,
      });
    case actionTypes.TUMBLR_CLEAR_POSTS:
      return assign({}, state, {
        find: initialState.tumblr.find,
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
    case getUser.fulfilled.toString(): {
      const defaultBlog = DEFAULT_BLOG || get(action.payload.blogs, '[0].name');
      return { ...state, blog: defaultBlog };
    }
    case setFormValue.toString():
      return assign({}, state, {
        [action.payload.key]: action.payload.value
      });
    case resetFormValue.toString():
      return assign({}, state, {
        [action.payload.key]: initialState.form[action.payload.key]
      });
    default:
      return state;
  }
};

const optionsReducer = (state = initialState.options, action) => {
  switch (action.type) {
    case setOption.toString():
      return assign({}, state, {
        [action.payload.key]: action.payload.value
      });
    case resetOptions.toString():
      return assign({}, initialState.options);
    default:
      return state;
  }
};

const errorsReducer = (state = initialState.errors, action) => {
  if (/\/rejected$/.test(action.type) && action.payload) {
    return [...state, { ...action.payload }];
  } else {
    return state;
  }
};

const loadingReducer = (state = initialState.loading, action) => {
  const postfix = action.type.match(/\/(pending|fulfilled|rejected)$/)?.[1];
  switch (postfix) {
    case 'pending':
      return true;
    case 'fulfilled':
    case 'rejected':
      return false;
    default:
      return state;
  }
};

export default combineReducers({
  tumblr: tumblrReducer,
  form: formReducer,
  options: optionsReducer,
  errors: errorsReducer,
  loading: loadingReducer,
});
