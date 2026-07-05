function sendError(res, statusCode, message, fields) {
  const error = { message };

  if (fields) {
    error.fields = fields;
  }

  return res.status(statusCode).json({ error });
}

function sendUnexpectedError(res, error, context) {
  console.error(`[${context}]`, error);
  return sendError(res, 500, "Unexpected server error");
}

module.exports = {
  sendError,
  sendUnexpectedError
};
