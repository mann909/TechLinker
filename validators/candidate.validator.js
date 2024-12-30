import { check } from "express-validator"

import validateRequest from "../utils/validateRequest.js"


export const validateRegister = [
    check('fullName')
    .exists()
    .withMessage('Name is Required')
    .not()
    .isEmpty()
    .withMessage('Name is Required') ,

    check('email')
    .exists()
    .withMessage('Email is Required')
    .not()
    .isEmpty()
    .withMessage('Email is Required') 
    .isEmail()
    .withMessage('Email is not valid')
    .normalizeEmail(),

    check('password')
    .exists()
    .withMessage('Password is Required')
    .not()
    .isEmpty()
    .withMessage('Password is Empty')
    .isLength({min:8})
    .withMessage('Password length should be atleast 8')
    .isLength({max:15})
    .withMessage('Password length should be less than 15')
    .matches(/^(?=.*[A-Z])/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/^(?=.*[0-9])/)
    .withMessage('Password must contain at least one number')
    .matches(/^(?=.*[!@#$%^&*])/)
    .withMessage('Password must contain at least one special character'),

    check('mobile')
    .exists()
    .withMessage('Mobile Number is Required')
    .not()
    .isEmpty()
    .withMessage('Mobile Number is Empty')
    .isLength({ min: 10, max: 10 })
    .withMessage('Mobile number must be exactly 10 digits')
    .matches(/^[0-9]+$/)
    .withMessage('Mobile number must contain only numbers'),


    check('otp')
    .exists()
    .withMessage('OTP is Required')
    .not()
    .isEmpty() 
    .isLength({ min: 4, max: 4 })
    .withMessage('OTP must be exactly 10 digits')
    .matches(/^[0-9]+$/)
    .withMessage('OTP must contain only numbers'),

    (req , res , next) => validateRequest(req , res , next)
]


export const validateLogin=[
    check('email')
    .exists()
    .withMessage('Email is Required')
    .not()
    .isEmpty()
    .withMessage('Email is Required') 
    .isEmail()
    .withMessage('Email is not valid')
    .normalizeEmail() ,

    check('password')
    .exists()
    .withMessage('Password Is Required')
    .not()
    .isEmpty()
    .withMessage('Password  Required') ,



    (req , res , next)=>validateRequest(req , res , next)


]