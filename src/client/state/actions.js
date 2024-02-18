import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import pick from 'lodash/pick';
import every from 'lodash/every';

import { apiFetch } from '../api';
import { METHODS, TUMBLR_QUEUE } from '../../consts';

export const websocketConnect = createAction('websocket/CONNECT');
export const websocketConnected = createAction('websocket/CONNECTED');
export const websocketDisconnect = createAction('websocket/DISCONNECT');
export const websocketDisconnected = createAction('websocket/DISCONNECTED');
export const websocketSend = createAction('websocket/SEND');
export const websocketReceive = createAction('websocket/RECEIVE');

export const setOption = createAction('options/SET', (key, value) => ({
  payload: { key, value },
}));

export const resetOptions = createAction('options/RESET');

export const setFormValue = createAction('form/SET_VALUE', (key, value) => ({
  payload: { key, value },
}));

export const resetFormValue = createAction('form/RESET_VALUE', key => ({
  payload: { key },
}));

export const nextStep = createAction('form/step/NEXT');
export const previousStep = createAction('form/step/PREVIOUS');
export const resetStep = createAction('form/step/RESET');

export const getUser = createAsyncThunk('tumblr/GET_USER', async (_, thunkAPI) => {
  try {
    return await apiFetch('GET', '/user')
  } catch (error) {
    if (error.statusText === 'No user session') {
      throw new Error('');
    }

    return thunkAPI.rejectWithValue(pick(error, ['status', 'statusText', 'body']));
  }
});

export const find = createAsyncThunk('tumblr/FIND_TAGS', async (_, thunkAPI) => {
  const { form: { blog, find }, options } = thunkAPI.getState();
  const methods = [METHODS.POSTS, options.includeQueue && METHODS.QUEUED, options.includeDrafts && METHODS.DRAFTS].filter(Boolean);
  const body = { blog, find, options, methods };

  try {
    const response = await apiFetch('POST', '/find', body);
    return thunkAPI.fulfillWithValue(response, { body });
  } catch (error) {
    return thunkAPI.rejectWithValue(pick(error, ['status', 'statusText', 'body']), { body });
  }
});

export const replace = createAsyncThunk('tumblr/REPLACE_TAGS', async (_, thunkAPI) => {
  const { form: { blog, find, replace }, posts: { entities }, options } = thunkAPI.getState();
  const body = {
    blog,
    find,
    replace,
    options,
    posts: Object.values(entities).map(post => ({ id: post.id_string, tags: post.tags })),
  };

  try {
    const response = await apiFetch('POST', '/replace', body);
    return thunkAPI.fulfillWithValue(response, { body });
  } catch (error) {
    return thunkAPI.rejectWithValue(pick(error, ['status', 'statusText', 'body']), { body });
  }
});

export const clearPosts = createAction('posts/CLEAR');

export const reset = () => dispatch => {
  return Promise.all([
    dispatch(clearPosts()),
    dispatch(resetStep()),
    dispatch(resetFormValue('find')),
    dispatch(resetFormValue('replace')),
  ]);
};

const isFindComplete = (payload, state) => {
  const methodsFound = {
    ...state.posts.methodsFound,
    [payload.methodName]: payload.complete,
  };
  return Object.values(methodsFound).every(Boolean);
};

const isReplaceComplete = (payload, state) => {
  const posts = {
    ...state.posts.entities,
    [payload.postId]: {
      replaced: true,
    },
  };
  return every(Object.values(posts), ['replaced', true]);
}

export const tumblrFindMessage = payload => (dispatch, getState) => {
  const state = getState();
  return dispatch({
    type: 'queue/tumblr/FIND',
    payload: {
      ...payload,
      foundPostsCount: Object.keys(state.posts.entities).length,
      allComplete: isFindComplete(payload, state)
    }
  });
};
tumblrFindMessage.toString = () => 'queue/tumblr/FIND';

export const tumblrReplaceMessage = (payload) => (dispatch, getState) => dispatch({
  type: 'queue/tumblr/REPLACE',
  payload: {
    ...payload,
    complete: isReplaceComplete(payload, getState()),
  }
});
tumblrReplaceMessage.toString = () => 'queue/tumblr/REPLACE';

export const jobTypeActionMap = {
  [`${TUMBLR_QUEUE}:find`]: tumblrFindMessage,
  [`${TUMBLR_QUEUE}:replace`]: tumblrReplaceMessage,
};