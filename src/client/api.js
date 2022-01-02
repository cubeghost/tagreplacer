export async function apiFetch(method, path, body) {
  const config = {
    method: method,
    credentials: 'include'
  };
  if (body) {
    config.headers = { 'Content-Type': 'application/json' };
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`/api${path}`, config)

  if (!response.ok) {
    const error = new Error(response.statusText);
    error.status = response.status;
    error.statusText = response.statusText;
    error.body = await response.json();
    throw error;
  }

  return await response.json();
}
