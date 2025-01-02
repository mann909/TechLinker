import express from 'express';
const router = express.Router();
import auth from '../middlewares/auth.middleware.js';
import trimRequest from 'trim-request';
import * as applicationController from '../controller/Application.controller.js';
import * as applicationValidator from '../validators/application.validators.js';

router.post(
  '/create-application',
  auth,
  trimRequest.all,
  applicationValidator.createApplicationValidator,
  applicationController.createApplication
);

// router.get(
//     '/get-applications',
//     auth,
//     trimRequest.all,
//     applicationController.getApplicationsDetails
//     );


export default router;