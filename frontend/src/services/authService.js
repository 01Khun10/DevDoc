import apiRequest from "./api";

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function normalizeName(name) {
  return name.trim();
}

async function register({ name, email, password }) {
  const response = await apiRequest("/api/auth/register", {
    method: "POST",
    body: {
      name: normalizeName(name || ""),
      email: normalizeEmail(email || ""),
      password
    }
  });

  return response.user;
}

async function login({ email, password }) {
  const response = await apiRequest("/api/auth/login", {
    method: "POST",
    body: {
      email: normalizeEmail(email || ""),
      password
    }
  });

  return response.user;
}

async function me() {
  const response = await apiRequest("/api/auth/me");
  return response.user;
}

async function logout() {
  await apiRequest("/api/auth/logout", { method: "POST" });
}

export default {
  register,
  login,
  me,
  logout
};
