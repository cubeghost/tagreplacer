import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import pick from 'lodash/pick';

import { apiFetch } from '../api';

export const actionTypes = {
  TUMBLR_GET_USER: 'tumblr/GET_USER',
  TUMBLR_FIND_TAGS: 'tumblr/FIND_TAGS',
  TUMBLR_REPLACE_TAGS: 'tumblr/REPLACE_TAGS',
  TUMBLR_CLEAR_POSTS: 'tumblr/CLEAR_POSTS',
  SET_OPTION: 'options/SET',
  RESET_OPTIONS: 'options/RESET',
  SET_FORM_VALUE: 'form/SET_VALUE',
  RESET_FORM_VALUE: 'form/RESET_VALUE',
  ADD_ERROR: 'errors/ADD',
  SET_LOADING: 'loading/SET',
};

export const websocketConnect = createAction('websocket/CONNECT');
export const websocketDisconnect = createAction('websocket/DISCONNECT');
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

const startLoading = () => ({
  type: actionTypes.SET_LOADING,
  loading: true,
});
const stopLoading = () => ({
  type: actionTypes.SET_LOADING,
  loading: false,
});
const thunkFetch = ({ actionType, method, path, body }) => dispatch => {
  const config = {
    method: method,
    credentials: 'include',
  };
  if (body) {
    config.headers = { 'Content-Type': 'application/json' };
    config.body = JSON.stringify(body);
  }

  dispatch(startLoading());

  return fetch(path, config)
    .then(response => {
      if (!response.ok) {
        response.json().then(json => {
          dispatch({
            type: actionTypes.ADD_ERROR,
            response: {
              status: response.status,
              statusText: response.statusText,
              body: json
            },
          });
          dispatch(stopLoading());
        });
        throw Error(response.statusText);
      }

      return response.json();
    })
    .then(response => (
      dispatch({
        type: actionType,
        response,
        meta: {
          body,
        },
      })
    ))
    .then(response => {
      dispatch(stopLoading());
      return response;
    });
};

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
  const body = { blog, find, options };

  try {
    const response = await apiFetch('POST', '/find', body);
    return thunkAPI.fulfillWithValue(response, { body, waitingForQueue: true });
  } catch (error) {
    return thunkAPI.rejectWithValue(pick(error, ['status', 'statusText', 'body']), { body });
  }
});


export const replace = () => (dispatch, getState) => {
  const { form: { blog, find, replace }, options } = getState();
  return dispatch(thunkFetch({
    actionType: actionTypes.TUMBLR_REPLACE_TAGS,
    method: 'POST',
    path: '/api/replace',
    body: {
      blog,
      find,
      replace,
      options,
    }
  }));
};


export const reset = () => dispatch => {
  return Promise.all([
    dispatch({
      type: actionTypes.TUMBLR_CLEAR_POSTS,
    }),
    dispatch(resetFormValue('find')),
    dispatch(resetFormValue('replace')),
  ]);
};

export const queueFoundPosts = createAction('queue/find/POSTS');

import queues from '../../queues';

export const queueActionMap = {
  [queues.FIND_QUEUE]: queueFoundPosts,
};