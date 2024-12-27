import express from 'express'
const router = express.Router()
import * as employerController from '../controller/Employer.controller.js'

router.post(
    '/register' ,
    employerController.registerEmployer

)

router.post(
    '/login' , 
    employerController.loginEmployer
    
)



export default router