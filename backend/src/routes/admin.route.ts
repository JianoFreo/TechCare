import { Router } from 'express';
import { getAdminDashboard } from '../controllers/admin.controller.js';
const router = Router();

router.get('/', getAdminDashboard);

export default router;