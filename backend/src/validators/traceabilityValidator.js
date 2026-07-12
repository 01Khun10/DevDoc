const SUPPORTED_LINKS = {
  "BUSINESS_OBJECTIVE->USE_CASE": "initiates",
  "USE_CASE->REQUIREMENT": "covers",
  "USE_CASE->DOCUMENT_SECTION": "described_by",
  "REQUIREMENT->DOCUMENT_SECTION": "described_by",
  "REQUIREMENT->DESIGN_ELEMENT": "implemented_by",
  "REQUIREMENT->TEST_CASE": "verified_by"
};

function getPairKey(sourceType, targetType) {
  return `${sourceType}->${targetType}`;
}

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

  if (typeof body.sourceType !== "string" || !body.sourceType.trim()) {
    fields.sourceType = "Source type is required";
  } else {
    values.sourceType = body.sourceType.trim();
  }

  if (typeof body.sourceId !== "string" || !body.sourceId.trim()) {
    fields.sourceId = "Source artefact is required";
  } else {
    values.sourceId = body.sourceId.trim();
  }

  if (typeof body.targetType !== "string" || !body.targetType.trim()) {
    fields.targetType = "Target type is required";
  } else {
    values.targetType = body.targetType.trim();
  }

  if (typeof body.targetId !== "string" || !body.targetId.trim()) {
    fields.targetId = "Target artefact is required";
  } else {
    values.targetId = body.targetId.trim();
  }

  if (Object.keys(fields).length === 0) {
    const pairKey = getPairKey(values.sourceType, values.targetType);
    const defaultLinkType = SUPPORTED_LINKS[pairKey];

    if (!defaultLinkType) {
      return {
        isValid: false,
        isUnsupportedPair: true,
        fields: {},
        values
      };
    }

    if (body.linkType === undefined || body.linkType === null || body.linkType === "") {
      values.linkType = defaultLinkType;
    } else if (typeof body.linkType !== "string" || body.linkType.trim() !== defaultLinkType) {
      fields.linkType = `Link type must be ${defaultLinkType}`;
    } else {
      values.linkType = body.linkType.trim();
    }
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
