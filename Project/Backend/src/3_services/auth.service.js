const bcrypt = require('bcryptjs');
const {
  createUser,
  findUserByEmail,
  findUserByUsername,
  findUserById,
} = require('../4_models/user.model');
const { signAccessToken } = require('../5_utils/jwt');
const { createHttpError } = require('../5_utils/httpError');
const { isNonEmptyString, isValidEmail } = require('../5_utils/validators');

async function register({ username, email, password }) {
  if (!isNonEmptyString(username) || username.trim().length < 3) {
    throw createHttpError(400, 'Username must be at least 3 characters long');
  }

  if (!isValidEmail(email)) {
    throw createHttpError(400, 'Invalid email format');
  }

  if (!isNonEmptyString(password) || password.length < 8) {
    throw createHttpError(400, 'Password must be at least 8 characters long');
  }

  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (findUserByUsername(normalizedUsername)) {
    throw createHttpError(409, 'Username is already registered');
  }

  if (findUserByEmail(normalizedEmail)) {
    throw createHttpError(409, 'Email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let user;
  try {
    user = createUser({
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
    });
  } catch (error) {
    if (String(error?.message).includes('UNIQUE constraint failed: users.')) {
      const field = String(error.message).includes('users.username') ? 'Username' : 'Email';
      throw createHttpError(409, `${field} is already registered`);
    }
    throw error;
  }

  const token = signAccessToken({
    userId: user.user_id,
    email: user.email,
    username: user.username,
  });

  return {
    user,
    token,
  };
}

async function login({ email, password }) {
  if (!isValidEmail(email)) {
    throw createHttpError(400, 'Invalid email format');
  }

  if (!isNonEmptyString(password)) {
    throw createHttpError(400, 'Password is required');
  }

  const userWithPassword = findUserByEmail(email.trim().toLowerCase());
  if (!userWithPassword) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, userWithPassword.password_hash);
  if (!isMatch) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const user = findUserById(userWithPassword.user_id);
  const token = signAccessToken({
    userId: user.user_id,
    email: user.email,
    username: user.username,
  });

  return {
    user,
    token,
  };
}

function me(userId) {
  const user = findUserById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return user;
}

module.exports = {
  register,
  login,
  me,
};
