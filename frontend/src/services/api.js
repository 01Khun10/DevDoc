const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}

/* Centralized session-expiry policy.
 * Any authenticated request that returns 401 means the session is gone:
 * redirect to /login once, instead of every page remembering useAuthGuard.
 * Auth endpoints are exempt — /api/auth/me returning 401 is the normal
 * "not logged in" signal during bootstrap, and login/register handle
 * their own 401s as credential errors. */
function isAuthPath(path) {
  return path.startsWith("/api/auth");
}

function isOnPublicRoute() {
  const p = window.location.pathname;
  return p === "/" || p === "/login" || p === "/register" || p.startsWith("/shared/");
}

let redirecting = false;
function handleSessionExpiry() {
  if (redirecting || isOnPublicRoute()) return;
  redirecting = true;
  window.location.assign("/login");
}

async function apiRequest(path, options = {}) {
  const { method = "GET", body, signal } = options;
  const headers = { Accept: "application/json" };

  const requestOptions = {
    method,
    headers,
    credentials: "include",
    signal
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, requestOptions);
  const data = await parseJsonSafely(response);

  if (!response.ok) {
    if (response.status === 401 && !isAuthPath(path)) {
      handleSessionExpiry();
    }

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

export default apiRequest;
