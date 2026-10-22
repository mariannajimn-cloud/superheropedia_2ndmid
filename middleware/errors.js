export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error instanceof ApiError ? error.status : 500;
  res.status(status).json({
    error: {
      status,
      message: status === 500 ? 'The request could not be completed.' : error.message
    }
  });
}
