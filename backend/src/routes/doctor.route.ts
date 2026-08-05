import { Router } from 'express';
import { ENV } from '../config/env.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import doctorMiddleware from '../middlewares/doctor.middleware.js';
const router = Router();


if (ENV.IS_PRODUCTION) {
    router.use(authMiddleware, doctorMiddleware);
    console.log('Doctor routes enabled');
}

export default router;
