const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const TOKEN_KEY = "devdoc_token";

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

async function parseJsonSafely(response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

async function apiRequest(path, options = {}) {
  const { method = "GET", body } = options;
  const headers = {
    Accept: "application/json"
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const requestOptions = {
    method,
    headers
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, requestOptions);
  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message = data?.error?.message || "Request failed";
    const error = new Error(message);
    error.status = response.status;

    if (data?.error?.fields) {
      error.fields = data.error.fields;
    }

    throw error;
  }

  return data;
}

export { TOKEN_KEY };
export default apiRequest;
