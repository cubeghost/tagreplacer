export function apiFetch(method, path, body) {
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

export function debugError(error) {
  if (window.location.search === '?debug') {
    console.log('debug:');
    console.log(error.stack);
  }
}

export function formatPosts(post) {

}


export const mapForSelect = value => ({ label: value, value: value });
