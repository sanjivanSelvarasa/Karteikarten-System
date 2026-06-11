const authService = require('../3_services/auth.service');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body || {});
    res.status(201).json({
      ok: true,
      message: 'User registered successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body || {});
    res.status(200).json({
      ok: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

function me(req, res, next) {
  try {
    const user = authService.me(req.user.userId);
    res.status(200).json({
      ok: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
}

function logout(_req, res) {
  res.status(200).json({
    ok: true,
    message: 'Logout successful on client side',
  });
}

module.exports = {
  register,
  login,
  me,
  logout,
};
