import { check } from "express-validator";
import validateRequest from "../utils/validateRequest.js";



export const listJobValidator = [
    check('post').exists().withMessage('Post field must exist').notEmpty().withMessage('Job post is required'),
    check('payroll').exists().withMessage('Payroll field must exist').notEmpty().withMessage('Payroll range is required'),
    check('qualifications').exists().withMessage('Qualifications field must exist').isArray().withMessage('Qualifications must be an array'),
    check('openings').exists().withMessage('Openings field must exist').notEmpty().withMessage('Number of openings is required'),
    check('description').exists().withMessage('Description field must exist').notEmpty().withMessage('Job description is required'),
    check('employmentType').exists().withMessage('Employment type field must exist').notEmpty().withMessage('Employment type is required'),
    check('hiringProcess').exists().withMessage('Hiring process field must exist').notEmpty().withMessage('Hiring process is required'),
     (req , res , next)=>validateRequest(req , res , next)
]