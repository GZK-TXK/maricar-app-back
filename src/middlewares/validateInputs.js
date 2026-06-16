import { validationResult } from 'express-validator'



export const validateImputs = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: false,
      msg: "Error", errors
    });
  }
  next();
};