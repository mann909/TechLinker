import express from 'express';
import authRoutes from './auth.routes.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import candidateRoutes from './candidate.routes.js';
import jobsRoutes from './jobs.routes.js';
import employerRoutes from './employer.routes.js';
import applicationRoutes from './application.routes.js';
const router = express.Router();
const v1 = express.Router();

v1.use('/auth', authRoutes);
v1.use('/candidate', candidateRoutes);
v1.use('/jobs', jobsRoutes);
v1.use('/employer', employerRoutes);
v1.use('/applications', applicationRoutes);

router.use('/api/v1', v1);

export default router;
