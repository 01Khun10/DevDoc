const { verifyToken } = require("../utils/token");
const { getUserById } = require("../services/authService");

function sendUnauthorized(res) {
  return res.status(401).json({
    error: {
      message: "Authentication required"
    }
  });
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || typeof authHeader !== "string") {
    return sendUnauthorized(res);
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer" || !parts[1]) {
    return sendUnauthorized(res);
  }

  try {
    const payload = verifyToken(parts[1]);

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
