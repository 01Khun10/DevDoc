const {
  duplicateEmailCode,
  invalidCredentialsCode,
  registerUser,
  loginUser
} = require("../services/authService");
const {
  validateRegisterInput,
  validateLoginInput
} = require("../validators/authValidator");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");
const { AUTH_COOKIE_NAME, AUTH_COOKIE_MAX_AGE_MS } = require("../constants/auth");

function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: AUTH_COOKIE_MAX_AGE_MS,
    path: "/"
  });
}

function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
}

async function register(req, res) {
  const validation = validateRegisterInput(req.body || {});

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const { user, token } = await registerUser(validation.values);
    setAuthCookie(res, token);
    return res.status(201).json({ user });
  } catch (error) {
    if (error.code === duplicateEmailCode) {
      return sendError(res, 409, "Email is already registered");
    }

    return sendUnexpectedError(res, error, "authController.register");
  }
}

async function login(req, res) {
  const validation = validateLoginInput(req.body || {});

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const { user, token } = await loginUser(validation.values);
    setAuthCookie(res, token);
    return res.status(200).json({ user });
  } catch (error) {
    if (error.code === invalidCredentialsCode) {
      return sendError(res, 401, "Invalid email or password");
    }

    return sendUnexpectedError(res, error, "authController.login");
  }
}

function logout(req, res) {
  clearAuthCookie(res);
  return res.status(200).json({ message: "Logged out" });
}

function me(req, res) {
  return res.status(200).json({ user: req.user });
}

module.exports = {
  register,
  login,
  logout,
  me
};
