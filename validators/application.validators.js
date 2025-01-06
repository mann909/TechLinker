import { check } from 'express-validator';

import validateRequest from '../utils/validateRequest.js';
import { query } from 'express-validator';

export const createApplicationValidator = [
  check('jobId')
    .exists()
    .withMessage('Job ID is Required')
    .not()
    .isEmpty()
    .withMessage('Job ID is Required'),

  (req, res, next) => validateRequest(req, res, next),
];


export const getApplicationsValidator=[

  query('search')
    .optional(),
  query('page')
    .optional(),
  query('limit')
    .optional() ,


  (req , res , next) =>validateRequest(req , res , next)
]


export const getJobApplicantsDetailsValidator = [
  query('jobId')
    .exists()
    .withMessage('Job ID is Required')
    .not()
    .isEmpty()
    .withMessage('Job ID is Required'),
    
  query('search')
    .optional(),
  query('page')
    .optional(),
  query('limit')
    .optional() ,

    
  (req, res, next) => validateRequest(req, res, next)
];
