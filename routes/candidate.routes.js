import express from 'express'
const router = express.Router()
import * as candidateController from '../controller/Candidate.controller.js';
import *  as candidateValidators from '../validators/candidate.validator.js'
import {upload} from '../config/cloudinary.js'
import auth from '../middlewares/auth.middleware.js'
import trimRequest from 'trim-request';

const uploadMiddleware = upload.fields([
    { name: 'panCardFile', maxCount: 1 },
    { name: 'drivingLicenseFile', maxCount: 1 },
    { name: 'passPortFile', maxCount: 1 },
    { name: 'resumeFile', maxCount: 1 }
  ]);
  

router.post(
    '/register' ,
    trimRequest.all ,
    candidateValidators.validateRegister ,
    candidateController.registerCandidate

)

router.post(
    '/login' , 
    trimRequest.all ,
    candidateValidators.validateLogin ,
    candidateController.loginCandidate
    
)

router.post(
    '/update-profile' ,
    auth,
    uploadMiddleware ,
    
    candidateController.updateProfile
)

export default router