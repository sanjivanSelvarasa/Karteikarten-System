function notFoundHandler(_req, res) {
  res.status(404).json({
    ok: false,
    message: 'Route not found',
  });
}

function errorHandler(err, _req, res, _next) {
  const isUniqueConstraint = String(err?.message).includes('UNIQUE constraint failed: users.');
  const status = err.status || (isUniqueConstraint ? 409 : 500);
  let message = err.message || 'Internal server error';

  if (isUniqueConstraint) {
    message = String(err.message).includes('users.username')
      ? 'Username is already registered'
      : 'Email is already registered';
  }

  res.status(status).json({
    ok: false,
    message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
