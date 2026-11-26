// Global error handler
module.exports = (err, req, res, next) => {
  const status = err.status || err.statusCode || err.http_code || 500;
  const message = err.message || err.error?.message || 'Internal Server Error';
  console.error(`[Error ${status}] ${req.method} ${req.originalUrl}:`, message);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
