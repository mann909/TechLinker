import { check } from 'express-validator';

import validateRequest from '../utils/validateRequest.js';

export const createApplicationValidator =[
    check('jobId')
    .exists()
    .withMessage('Job ID is Required')
    .not()
    .isEmpty()
    .withMessage('Job ID is Required'),

    (req, res, next) => validateRequest(req, res, next),
]