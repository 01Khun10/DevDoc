const bcrypt = require("bcryptjs");
const prisma = require("../utils/prisma");
const { generateToken } = require("../utils/token");
const { DUPLICATE_EMAIL, INVALID_CREDENTIALS, WRONG_PASSWORD } = require("../constants/errorCodes");

const duplicateEmailCode = DUPLICATE_EMAIL;
const invalidCredentialsCode = INVALID_CREDENTIALS;
const wrongPasswordCode = WRONG_PASSWORD;

function sanitizeUser(user) {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

function isPrismaDuplicateEmailError(error) {
  return error && error.code === "P2002" && Array.isArray(error.meta && error.meta.target)
    ? error.meta.target.includes("email")
    : error && error.code === "P2002";
}

function createAuthError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

async function registerUser({ name, email, password }) {
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createAuthError(duplicateEmailCode, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash
      }
    });

    return {
      user: sanitizeUser(user),
      token: generateToken(user.id)
    };
  } catch (error) {
    if (isPrismaDuplicateEmailError(error)) {
      throw createAuthError(duplicateEmailCode, "Email is already registered");
    }

    throw error;
  }
}

async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw createAuthError(invalidCredentialsCode, "Invalid email or password");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw createAuthError(invalidCredentialsCode, "Invalid email or password");
  }

  return {
    user: sanitizeUser(user),
    token: generateToken(user.id)
  };
}

async function getUserById(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  return user ? sanitizeUser(user) : null;
}

async function updateUserName(userId, name) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: name || null }
  });

  return sanitizeUser(user);
}

async function changePassword(userId, currentPassword, newPassword) {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw createAuthError(invalidCredentialsCode, "User not found");
  }

  const currentMatches = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!currentMatches) {
    throw createAuthError(wrongPasswordCode, "Current password is incorrect");
  }

  const newHash = await bcrypt.hash(newPassword, 12);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash }
  });

  return sanitizeUser(updated);
}

module.exports = {
  duplicateEmailCode,
  invalidCredentialsCode,
  wrongPasswordCode,
  registerUser,
  loginUser,
  getUserById,
  updateUserName,
  changePassword,
  sanitizeUser
};
