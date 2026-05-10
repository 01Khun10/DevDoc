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

function validateCreateUseCaseInput(body) {
  const fields = {};
  const values = {};

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      fields: { general: "Invalid request body" },
      values
    };
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

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values
  };
}

function validateUpdateUseCaseInput(body) {
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

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values
  };
}

module.exports = {
  validateCreateUseCaseInput,
  validateUpdateUseCaseInput
};
