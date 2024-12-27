import express from 'express'
const router = express.Router()
import * as jonController from '../controller/Job.controller.js'
import auth from '../middlewares/auth.middleware.js'


router.post(
    '/list-job' ,
    auth,
    jonController.listJob

)





export default router