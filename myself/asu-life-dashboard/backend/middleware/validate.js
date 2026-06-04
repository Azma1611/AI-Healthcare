import { ApiError } from '../utils/apiError.js';

export const requireFields = (...fields) => (req, res, next) => {
  const missing = fields.filter((field) => {
    const value = req.body[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length) {
    throw new ApiError(`Missing required field(s): ${missing.join(', ')}`, 400);
  }

  next();
};
