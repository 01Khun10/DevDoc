function validateCreateDocumentFromTemplateInput(body) {
  const fields = {};
  const values = {};

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      fields: { general: "Invalid request body" },
      values
    };
  }

  if (typeof body.templateCode !== "string") {
    fields.templateCode = "Template code is required";
  } else {
    const templateCode = body.templateCode.trim();

    if (!templateCode) {
      fields.templateCode = "Template code is required";
    } else {
      values.templateCode = templateCode;
    }
  }

  if (body.title !== undefined && body.title !== null) {
    if (typeof body.title !== "string") {
      fields.title = "Title must be a string";
    } else {
      const title = body.title.trim();

      if (title.length > 200) {
        fields.title = "Title must be 200 characters or less";
      } else if (title) {
        values.title = title;
      }
    }
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values
  };
}

module.exports = {
  validateCreateDocumentFromTemplateInput
};
