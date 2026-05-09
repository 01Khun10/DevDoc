const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  if (typeof email !== "string") {
    return "";
  }

  return email.trim().toLowerCase();
}

function normalizeName(name) {
  if (typeof name !== "string") {
    return null;
  }

  const trimmedName = name.trim();
  return trimmedName.length > 0 ? trimmedName : null;
}

function validateRegisterInput(body) {
  const fields = {};
  const email = normalizeEmail(body.email);
  const name = normalizeName(body.name);
  const password = typeof body.password === "string" ? body.password : "";

  if (!email) {
    fields.email = "Email is required";
  } else if (!emailRegex.test(email)) {
    fields.email = "Email must be a valid email address";
  }

  if (!password) {
    fields.password = "Password is required";
  } else if (password.length < 8) {
    fields.password = "Password must be at least 8 characters";
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values: {
      name,
      email,
      password
    }
  };
}

function validateLoginInput(body) {
  const fields = {};
  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  if (!email) {
    fields.email = "Email is required";
  }

  if (!password) {
    fields.password = "Password is required";
  }

  return {
    isValid: Object.keys(fields).length === 0,
    fields,
    values: {
      email,
      password
    }
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput
};
