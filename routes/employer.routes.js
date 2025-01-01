import express from 'express';
const router = express.Router();
import * as employerController from '../controller/Employer.controller.js';
import * as employerValidator from '../validators/employer.validators.js';
import trimRequest from 'trim-request';
import auth from '../middlewares/auth.middleware.js';

router.post(
  '/register',
  trimRequest.all,
  employerValidator.validateRegister,
  employerController.registerEmployer
);

router.post(
  '/login',
  trimRequest.all,
  employerValidator.validateLogin,
  employerController.loginEmployer
);

router.get(
  '/get-profile',
  trimRequest.all,
  auth,
  employerValidator.validateGetEmployerProfile,
  employerController.getEmployerProfile
);

router.post(
  '/update-profile',
  trimRequest.all,
  auth,
  employerValidator.validateUpdateEmployerProfile,
  employerController.updateEmployerProfile
);

export default router;
