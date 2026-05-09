function validateCreateTraceabilityLinkInput(body) {
  const fields = {};
  const values = {};

  if (!body || typeof body !== "object") {
    return {
      isValid: false,
      fields: { general: "Invalid request body" },
      values
    };
  }

  if (body.sourceType !== "REQUIREMENT") {
    fields.sourceType = "Source type must be REQUIREMENT";
  } else {
    values.sourceType = body.sourceType;
  }

  if (typeof body.sourceId !== "string" || !body.sourceId.trim()) {
    fields.sourceId = "Source requirement is required";
  } else {
    values.sourceId = body.sourceId.trim();
  }

  if (body.targetType !== "DOCUMENT_SECTION") {
    fields.targetType = "Target type must be DOCUMENT_SECTION";
  } else {
    values.targetType = body.targetType;
  }

  if (typeof body.targetId !== "string" || !body.targetId.trim()) {
    fields.targetId = "Target document section is required";
  } else {
    values.targetId = body.targetId.trim();
  }

  if (body.linkType === undefined || body.linkType === null || body.linkType === "") {
    values.linkType = "described_by";
  } else if (body.linkType !== "described_by") {
    fields.linkType = "Link type must be described_by";
  } else {
    values.linkType = body.linkType;
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values
  };
}

module.exports = {
  validateCreateTraceabilityLinkInput
};
