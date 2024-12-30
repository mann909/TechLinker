import express from 'express'
const router = express.Router()
import * as jobController from '../controller/Job.controller.js'
import * as jobValidator from '../validators/job.validator.js' 
import auth from '../middlewares/auth.middleware.js'
import trimRequest from 'trim-request'


router.post(
    '/list-job' ,
    auth,
    trimRequest.all ,
    jobValidator.listJobValidator ,
    jobController.listJob

)





export default router