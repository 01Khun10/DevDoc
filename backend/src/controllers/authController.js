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

function sendError(res, statusCode, message, fields) {
  const error = { message };

  if (fields) {
    error.fields = fields;
  }

  return res.status(statusCode).json({ error });
}

async function register(req, res) {
  const validation = validateRegisterInput(req.body || {});

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const result = await registerUser(validation.values);
    return res.status(201).json(result);
  } catch (error) {
    if (error.code === duplicateEmailCode) {
      return sendError(res, 409, "Email is already registered");
    }

    return sendError(res, 500, "Unexpected server error");
  }
}

async function login(req, res) {
  const validation = validateLoginInput(req.body || {});

  if (!validation.isValid) {
    return sendError(res, 400, "Validation failed", validation.fields);
  }

  try {
    const result = await loginUser(validation.values);
    return res.status(200).json(result);
  } catch (error) {
    if (error.code === invalidCredentialsCode) {
      return sendError(res, 401, "Invalid email or password");
    }

    return sendError(res, 500, "Unexpected server error");
  }
}

function me(req, res) {
  return res.status(200).json({ user: req.user });
}

module.exports = {
  register,
  login,
  me
};
