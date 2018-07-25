import _ from 'lodash';

const PRODUCTION = process.env.NODE_ENV === 'production';
const DEFAULT_BLOG = PRODUCTION ? undefined : process.env.TESTING_BLOG;

export const actionTypes = {
  TUMBLR_GET_USER: 'tumblr/GET_USER',
  TUMBLR_FIND_TAGS: 'tumblr/FIND_TAGS',
  TUMBLR_REPLACE_TAGS: 'tumblr/REPLACE_TAGS',
  SET_OPTION: 'options/SET',
  RESET_OPTIONS: 'options/RESET',
  SET_FORM_VALUE: 'form/SET_VALUE',
  ADD_ERROR: 'errors/ADD',
  SET_LOADING: 'loading/SET',
};

const GET = 'GET';
const POST = 'POST';

const startLoading = () => ({
  type: actionTypes.SET_LOADING,
  loading: true,
});

const stopLoading = () => ({
  type: actionTypes.SET_LOADING,
  loading: false,
});

export const setOption = (key, value) => ({
  type: actionTypes.SET_OPTION,
  key,
  value,
});

export const resetOptions = () => ({
  type: actionTypes.RESET_OPTIONS,
});



export const setFormValue = (key, value) => ({
  type: actionTypes.SET_FORM_VALUE,
  key,
  value,
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
        response
      })
    ))
    .then(() => dispatch(stopLoading()));
};

export const getUser = () => (dispatch, getState) => {
  return dispatch(thunkFetch({
    actionType: actionTypes.TUMBLR_GET_USER,
    method: GET,
    path: '/api/user',
  })).then(() => {
    const { tumblr: { blogs } } = getState();
    const defaultBlog = DEFAULT_BLOG || _.get(blogs, '[0].name');
    if (defaultBlog) {
      return dispatch(setFormValue('blog', defaultBlog));
    }
  });
};

export const find = () => (dispatch, getState) => {
  const { form: { blog, find }, options } = getState();
  return dispatch(thunkFetch({
    actionType: actionTypes.TUMBLR_FIND_TAGS,
    method: POST,
    path: '/api/find',
    body: {
      blog,
      find,
      options,
    }
  }));
};
