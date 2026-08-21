import { Router } from 'express';
import { login } from '../controllers/auth/postRequests.controller.js';
import { logout } from '../controllers/auth/updateRequests.controller.js';

const router = Router();
router.post('/login', login);
router.patch('/logout', logout);

export default router;