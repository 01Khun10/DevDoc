function validateCreateProjectInput(body) {
  const fields = {};
  const values = {};

  if (!body || typeof body !== 'object') {
    return { isValid: false, fields: { general: "Invalid request body" }, values };
  }

  // Name validation
  if (typeof body.name === 'string') {
    const trimmedName = body.name.trim();
    if (trimmedName.length === 0) {
      fields.name = "Project name is required";
    } else if (trimmedName.length > 200) {
      fields.name = "Project name must be 200 characters or less";
    } else {
      values.name = trimmedName;
    }
  } else {
    fields.name = "Project name is required";
  }

  // Description validation
  if (body.description !== undefined) {
    if (typeof body.description === 'string') {
      const trimmedDesc = body.description.trim();
      if (trimmedDesc.length === 0) {
        values.description = null;
      } else if (trimmedDesc.length > 5000) {
        fields.description = "Description must be 5000 characters or less";
      } else {
        values.description = trimmedDesc;
      }
    } else if (body.description === null) {
      values.description = null;
    }
  }

  // profileId validation
  if (body.profileId !== undefined) {
    if (body.profileId === null) {
        values.profileId = null;
    } else if (typeof body.profileId === 'string' && body.profileId.trim() !== '') {
        values.profileId = body.profileId.trim();
    } else {
        values.profileId = null;
    }
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values
  };
}

function validateUpdateProjectInput(body) {
  const fields = {};
  const values = {};

  if (!body || typeof body !== 'object') {
    return { isValid: false, fields: { general: "Invalid request body" }, values };
  }

  // Name validation
  if (body.name !== undefined) {
    if (typeof body.name === 'string') {
      const trimmedName = body.name.trim();
      if (trimmedName.length === 0) {
        fields.name = "Project name cannot be empty";
      } else if (trimmedName.length > 200) {
        fields.name = "Project name must be 200 characters or less";
      } else {
        values.name = trimmedName;
      }
    } else {
      fields.name = "Project name must be a string";
    }
  }

  // Description validation
  if (body.description !== undefined) {
    if (typeof body.description === 'string') {
      const trimmedDesc = body.description.trim();
      if (trimmedDesc.length === 0) {
        values.description = null;
      } else if (trimmedDesc.length > 5000) {
        fields.description = "Description must be 5000 characters or less";
      } else {
        values.description = trimmedDesc;
      }
    } else if (body.description === null) {
      values.description = null;
    }
  }

  // Status validation
  if (body.status !== undefined) {
      if (typeof body.status === 'string') {
          const trimmedStatus = body.status.trim();
          if (trimmedStatus.length === 0) {
              values.status = null;
          } else if (trimmedStatus.length > 50) {
              fields.status = "Status must be 50 characters or less";
          } else {
              values.status = trimmedStatus;
          }
      } else if (body.status === null) {
          values.status = null;
      }
  }

  // profileId validation
  if (body.profileId !== undefined) {
    if (body.profileId === null) {
        values.profileId = null;
    } else if (typeof body.profileId === 'string' && body.profileId.trim() !== '') {
        values.profileId = body.profileId.trim();
    } else {
        values.profileId = null;
    }
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values
  };
}

module.exports = {
  validateCreateProjectInput,
  validateUpdateProjectInput
};
