const { verifyToken } = require("../utils/token");
const { getUserById } = require("../services/authService");
const { AUTH_COOKIE_NAME } = require("../constants/auth");

function sendUnauthorized(res) {
  return res.status(401).json({
    error: {
      message: "Authentication required"
    }
  });
}

async function authMiddleware(req, res, next) {
  const token = req.cookies && req.cookies[AUTH_COOKIE_NAME];

  if (!token || typeof token !== "string") {
    return sendUnauthorized(res);
  }

  try {
    const payload = verifyToken(token);

    if (!payload || !payload.userId) {
      return sendUnauthorized(res);
    }

    const user = await getUserById(payload.userId);

    if (!user) {
      return sendUnauthorized(res);
    }

    req.user = user;
    return next();
  } catch (error) {
    return sendUnauthorized(res);
  }
}

module.exports = authMiddleware;
