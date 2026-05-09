const VALID_TYPES = ["FR", "NFR"];
const VALID_PRIORITIES = ["HIGH", "MEDIUM", "LOW"];
const VALID_STATUSES = ["PROPOSED", "APPROVED", "IMPLEMENTED", "VERIFIED"];

function normalizeOptionalText(value, fieldName, fields, maxLength) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    fields[fieldName] = `${fieldName} must be a string`;
    return undefined;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  if (trimmed.length > maxLength) {
    fields[fieldName] = `${fieldName} must be ${maxLength} characters or less`;
    return undefined;
  }

  return trimmed;
}

function validateCreateRequirementInput(body) {
  const fields = {};
  const values = {};

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      fields: { general: "Invalid request body" },
      values
    };
  }

  if (typeof body.type !== "string" || !VALID_TYPES.includes(body.type)) {
    fields.type = "Type must be FR or NFR";
  } else {
    values.type = body.type;
  }

  if (typeof body.title !== "string") {
    fields.title = "Title is required";
  } else {
    const title = body.title.trim();

    if (!title) {
      fields.title = "Title is required";
    } else if (title.length > 200) {
      fields.title = "Title must be 200 characters or less";
    } else {
      values.title = title;
    }
  }

  const description = normalizeOptionalText(body.description, "description", fields, 5000);
  if (description !== undefined) {
    values.description = description;
  }

  if (body.priority !== undefined && body.priority !== null && body.priority !== "") {
    if (typeof body.priority !== "string" || !VALID_PRIORITIES.includes(body.priority)) {
      fields.priority = "Priority must be HIGH, MEDIUM, or LOW";
    } else {
      values.priority = body.priority;
    }
  }

  const acceptanceCriteria = normalizeOptionalText(
    body.acceptanceCriteria,
    "acceptanceCriteria",
    fields,
    5000
  );
  if (acceptanceCriteria !== undefined) {
    values.acceptanceCriteria = acceptanceCriteria;
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values
  };
}

function validateUpdateRequirementInput(body) {
  const fields = {};
  const values = {};

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      fields: { general: "Invalid request body" },
      values
    };
  }

  if (body.title !== undefined) {
    if (typeof body.title !== "string") {
      fields.title = "Title must be a string";
    } else {
      const title = body.title.trim();

      if (!title) {
        fields.title = "Title cannot be empty";
      } else if (title.length > 200) {
        fields.title = "Title must be 200 characters or less";
      } else {
        values.title = title;
      }
    }
  }

  const description = normalizeOptionalText(body.description, "description", fields, 5000);
  if (description !== undefined) {
    values.description = description;
  }

  if (body.priority !== undefined) {
    if (body.priority === null || body.priority === "") {
      values.priority = null;
    } else if (typeof body.priority !== "string" || !VALID_PRIORITIES.includes(body.priority)) {
      fields.priority = "Priority must be HIGH, MEDIUM, or LOW";
    } else {
      values.priority = body.priority;
    }
  }

  if (body.status !== undefined) {
    if (typeof body.status !== "string" || !VALID_STATUSES.includes(body.status)) {
      fields.status = "Status must be PROPOSED, APPROVED, IMPLEMENTED, or VERIFIED";
    } else {
      values.status = body.status;
    }
  }

  const acceptanceCriteria = normalizeOptionalText(
    body.acceptanceCriteria,
    "acceptanceCriteria",
    fields,
    5000
  );
  if (acceptanceCriteria !== undefined) {
    values.acceptanceCriteria = acceptanceCriteria;
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values
  };
}

module.exports = {
  validateCreateRequirementInput,
  validateUpdateRequirementInput
};
