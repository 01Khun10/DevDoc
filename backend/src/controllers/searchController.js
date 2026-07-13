const { searchAll } = require("../services/searchService");
const { sendError, sendUnexpectedError } = require("../utils/httpErrors");

async function search(req, res) {
  const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (query.length < 2 || query.length > 200) {
    return sendError(res, 400, "Query must be between 2 and 200 characters");
  }

  const parsedLimit = Number.parseInt(req.query.limit, 10);
  const limit = Number.isInteger(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 10) : 10;

  try {
    const results = await searchAll(req.user.id, query, limit);
    return res.status(200).json({ results });
  } catch (error) {
    return sendUnexpectedError(res, error, "searchController.search");
  }
}

module.exports = { search };
