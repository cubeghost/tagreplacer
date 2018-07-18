var { Promise } = require('es6-promise');

require('whatwg-fetch');


function apiFetch(method, path, body) {
  return new Promise(function(resolve, reject) {

    var config = {
      method: method,
      credentials: 'include'
    };
    if (body) {
      config.headers = { 'Content-Type': 'application/json' };
      config.body = JSON.stringify(body);
    }

    fetch('/api' + path, config)
    .then(function(response) {
      if (!response.ok) { throw Error(response.statusText); }
      return response.json();
    })
    .then(resolve)
    .catch(reject);

  });
}

function debugError(error) {
  if (window.location.search === '?debug') {
    console.log('debug:');
    console.log(error.stack);
  }
}

function formatPosts(post) {

}


module.exports = {
  apiFetch: apiFetch,
  debugError: debugError,
  formatPosts: formatPosts
};
