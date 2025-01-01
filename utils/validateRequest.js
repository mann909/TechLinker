import { validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';
import buildErrorObject from './buildErrorObject.js';

const validateRequest = (req, res, next) => {
  try {
    validationResult(req).throw();
    next();
  } catch (err) {
    res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .send(buildErrorObject(StatusCodes.UNPROCESSABLE_ENTITY, err));
  }
};

export default validateRequest;
