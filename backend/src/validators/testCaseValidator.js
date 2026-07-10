const VALID_STATUSES = ["DRAFT", "READY", "PASSED", "FAILED", "BLOCKED"];

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

function validateTitle(body, fields, values, { required }) {
  if (body.title === undefined) {
    if (required) {
      fields.title = "Title is required";
    }
    return;
  }

  if (typeof body.title !== "string") {
    fields.title = required ? "Title is required" : "Title must be a string";
    return;
  }

  const title = body.title.trim();

  if (!title) {
    fields.title = required ? "Title is required" : "Title cannot be empty";
  } else if (title.length > 200) {
    fields.title = "Title must be 200 characters or less";
  } else {
    values.title = title;
  }
}

function collectFields(body, fields, values, { required }) {
  validateTitle(body, fields, values, { required });

  const description = normalizeOptionalText(body.description, "description", fields, 5000);
  if (description !== undefined) {
    values.description = description;
  }

  const expectedResult = normalizeOptionalText(
    body.expectedResult,
    "expectedResult",
    fields,
    5000
  );
  if (expectedResult !== undefined) {
    values.expectedResult = expectedResult;
  }

  if (body.status !== undefined) {
    if (body.status === null || body.status === "") {
      values.status = null;
    } else if (typeof body.status !== "string" || !VALID_STATUSES.includes(body.status)) {
      fields.status = "Status must be DRAFT, READY, PASSED, FAILED, or BLOCKED";
    } else {
      values.status = body.status;
    }
  }
}

function validateCreateTestCaseInput(body) {
  const fields = {};
  const values = {};

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      fields: { general: "Invalid request body" },
      values
    };
  }

  collectFields(body, fields, values, { required: true });

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values
  };
}

function validateUpdateTestCaseInput(body) {
  const fields = {};
  const values = {};

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      fields: { general: "Invalid request body" },
      values
    };
  }

  collectFields(body, fields, values, { required: false });

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values
  };
}

module.exports = {
  validateCreateTestCaseInput,
  validateUpdateTestCaseInput
};
