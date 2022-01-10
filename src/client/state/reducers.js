import { assign } from 'lodash';
import { combineReducers } from 'redux';
import get from 'lodash/get';
import pick from 'lodash/pick';

import initialState from './initial';
import {
  actionTypes,
  getUser,
  find,
  setFormValue,
  resetFormValue,
  setOption,
  resetOptions,
  findQueueMessage,
} from './actions';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DEFAULT_BLOG = IS_PRODUCTION ? undefined : process.env.TESTING_BLOG;

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
      return { ...state,
        username: action.payload.name,
        blogs: action.payload.blogs.map(blog => blog.name),
      };
    case find.fulfilled.toString():
      return { ...state, find: action.meta.body.find };
    case findQueueMessage.toString():
      return {
        ...state,
        posts: (state.posts || []).concat(action.payload.posts),
      };
    case actionTypes.TUMBLR_CLEAR_POSTS:
      return {
        ...state,
        ...pick(initialState.tumblr, ['find', 'posts', 'queued', 'drafts']),
      };
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
      return { ...state,
        [action.payload.key]: action.payload.value,
      };
    case resetFormValue.toString():
      return { ...state,
        [action.payload.key]: initialState.form[action.payload.key],
      };
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
  if (postfix && !action.meta?.waitingForQueue) {
    switch (postfix) {
      case 'pending':
        return true;
      case 'fulfilled':
      case 'rejected':
        return false;
      default:
        return state;
    }
  } else if (action.type.startsWith('queue')) {
    return !action.payload.complete;
  } else {
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
