const env = require('../config/env');

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const payload = {
    success: false,
    message: err.message || 'Error interno del servidor',
    code: err.code || 'INTERNAL_ERROR',
  };

  if (env.nodeEnv === 'development' && !err.isOperational) {
    payload.stack = err.stack;
  }

  if (req.path.startsWith('/api')) {
    return res.status(status).json(payload);
  }

  if (status === 401) {
    return res.redirect('/login');
  }

  return res.status(status).render('pages/error', {
    title: 'Error',
    message: payload.message,
    status,
  });
}

module.exports = errorHandler;
