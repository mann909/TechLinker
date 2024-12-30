import express from 'express'
import * as authController from '../controller/Auth.controller.js'
import * as authValidators from '../validators/auth.validators.js'
import trimRequest from 'trim-request'


const router = express.Router()




router.get('/verify-token', 
    authController.verifyToken
);


router.delete(
    '/logout' ,
    authController.logOut
)


router.post(
    '/send-otp', 
    trimRequest.all,
    authValidators.sendOtpValidator,
    authController.sendOtp
)

export default  router


