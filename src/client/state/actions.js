export const actionTypes = {
  TUMBLR_GET_USER: 'tumblr/GET_USER',
  TUMBLR_FIND_TAGS: 'tumblr/FIND_TAGS',
  TUMBLR_REPLACE_TAGS: 'tumblr/REPLACE_TAGS',
  SET_OPTION: 'options/SET',
  SET_FORM_VALUE: 'form/SET_VALUE',
  ADD_ERROR: 'errors/ADD',
  SET_LOADING: 'loading/SET',
};

const GET = 'GET';
// const POST = 'POST';

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
        return dispatch({
          type: actionTypes.ADD_ERROR,
          response,
        }).then(() => {
          throw Error(response.statusText);
        });
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

export const getTumblrUser = () => dispatch => {
  return dispatch(thunkFetch({
    actionType: actionTypes.TUMBLR_GET_USER,
    method: GET,
    path: '/api/user',
  }));
};
