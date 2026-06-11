function notFoundHandler(_req, res) {
  res.status(404).json({
    ok: false,
    message: 'Route not found',
  });
}

function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    ok: false,
    message,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
