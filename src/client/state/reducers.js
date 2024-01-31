import { assign } from 'lodash';
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';

import initialState from './initial';
import {
  getUser,
  find,
  replace,
  setFormValue,
  resetFormValue,
  nextStep,
  previousStep,
  resetStep,
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
      return {
        ...state,
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
      return {
        entities: initialState.posts.entities,
        loading: true,
      };
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
    case find.fulfilled.toString():
      return {
        ...state,
        methodsFound: Object.fromEntries(action.meta.body.methods.map(method => ([method, false]))),
      };
    case tumblrFindMessage.toString():
      return {
        ...state,
        entities: {
          ...state.entities,
          ...keyBy(action.payload.posts, 'id'),
        },
        loading: !action.payload.allComplete,
        methodsFound: {
          ...state.methodsFound,
          [action.payload.methodName]: action.payload.complete,
        },
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
      return {
        ...state,
        entities: entities,
        loading: !action.payload.complete,
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
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };
    case resetFormValue.toString():
      return {
        ...state,
        [action.payload.key]: initialState.form[action.payload.key],
      };
    case tumblrFindMessage.toString():
      return {
        ...state,
        step: (action.payload.foundPostsCount > 0 && action.payload.allComplete) ? state.step + 1 : state.step,
      };
    case tumblrReplaceMessage.toString():
      return {
        ...state,
        step: action.payload.complete ? state.step + 1 : state.step,
      };
    case nextStep.toString():
      return {
        ...state,
        step: state.step + 1,
      };
    case previousStep.toString():
      return {
        ...state,
        step: state.step - 1,
      };
    case resetStep.toString():
      return {
        ...state,
        step: 0,
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

export default combineReducers({
  tumblr: tumblrReducer,
  posts: postsReducer,
  form: formReducer,
  options: optionsReducer,
  errors: errorsReducer,
});
