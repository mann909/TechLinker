import express from 'express'
const router = express.Router()
import * as employerController from '../controller/Employer.controller.js'
import * as employerValidator from '../validators/employer.validators.js'
import trimRequest from 'trim-request'

router.post(

    '/register' ,
    trimRequest.all ,
    employerValidator.validateRegister ,
    employerController.registerEmployer

)

router.post(
    '/login' , 
    trimRequest.all  ,
    employerValidator.validateLogin ,
    employerController.loginEmployer
    
)



export default router