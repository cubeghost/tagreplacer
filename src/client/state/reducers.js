import { assign } from 'lodash';
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';
import every from 'lodash/every';

import initialState from './initial';
import {
  getUser,
  find,
  replace,
  setFormValue,
  resetFormValue,
  setOption,
  resetOptions,
  clearPosts,
  tumblrFindMessage,
  tumblrReplaceMessage,
} from './actions';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DEFAULT_BLOG = IS_PRODUCTION ? undefined : process.env.TESTING_BLOG;

const tumblrReducer = (state = initialState.tumblr, action) => {
  switch (action.type) {
    case getUser.fulfilled.toString():
      return { ...state,
        loading: false,
        username: action.payload.name,
        blogs: action.payload.blogs,
      };
    case getUser.pending.toString():
      return {
        ...state,
        loading: true,
      };
    case getUser.rejected.toString():
      return {
        ...state,
        loading: false,
      };
    default:
      return state;
  }
};

const postsReducer = (state = initialState.posts, action) => {
  switch (action.type) {
    case find.pending.toString():
    case replace.pending.toString():
      return {
        ...state,
        loading: true,
      };
    case find.rejected.toString():
    case replace.rejected.toString():
      return {
        ...state,
        loading: false,
      };
    case tumblrFindMessage.toString():
      return {
        ...state,
        entities: {
          ...state.entities,
          ...keyBy(action.payload.posts, 'id'),
        },
        loading: !action.payload.complete,
      };
    case tumblrReplaceMessage.toString(): {
      const post = {
        ...state.entities[action.payload.postId],
        tags: action.payload.tags,
        replaced: true,
      };
      const entities = {
        ...state.entities,
        [action.payload.postId]: post,
      };
      const complete = every(Object.values(entities), ['replaced', true]);
      return {
        ...state,
        entities: entities,
        loading: !complete,
      };
    }
    case clearPosts.toString():
      return initialState.posts;
    default:
      return state;
  }
};

const formReducer = (state = initialState.form, action) => {
  switch (action.type) {
    case getUser.fulfilled.toString(): {
      const defaultBlog = DEFAULT_BLOG || action.payload.blogs[0];
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

// const loadingReducer = (state = initialState.loading, action) => {
//   const postfix = action.type.match(/\/(pending|fulfilled|rejected)$/)?.[1];
//   if (postfix && !action.meta?.waitingForQueue) {
//     switch (postfix) {
//       case 'pending':
//         return true;
//       case 'fulfilled':
//       case 'rejected':
//         return false;
//       default:
//         return state;
//     }
//   } else if (action.type === tumblrFindMessage.toString()) {
//     return !action.payload.complete;
//   } else {
//     return state;
//   }
// };

export default combineReducers({
  tumblr: tumblrReducer,
  posts: postsReducer,
  form: formReducer,
  options: optionsReducer,
  errors: errorsReducer,
});
