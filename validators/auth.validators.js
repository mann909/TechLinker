import { check } from 'express-validator';
import validateRequest from '../utils/validateRequest.js';

export const sendOtpValidator = [
  check('email')
    .exists()
    .withMessage('Email Is Required')
    .not()
    .isEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email is not valid'),

  (req, res, next) => validateRequest(req, res, next),
];
