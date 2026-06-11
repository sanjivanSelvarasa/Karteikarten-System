const { verifyAccessToken } = require('../5_utils/jwt');
const { createHttpError } = require('../5_utils/httpError');

function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createHttpError(401, 'Missing or invalid Authorization header'));
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    };
    return next();
  } catch (_error) {
    return next(createHttpError(401, 'Invalid or expired token'));
  }
}

module.exports = {
  requireAuth,
};
