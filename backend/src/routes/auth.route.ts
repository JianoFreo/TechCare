import { Router } from 'express';
import { login } from '../controllers/auth/postRequests.controller.js';

const router = Router();
router.post('/login', login);

export default router;