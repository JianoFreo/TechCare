import { Router } from 'express';
import { 
    getAdminDashboard,
    addNewUser,
    viewAllUsers,
    deleteUser,
    updateUser
} from '../controllers/admin.controller.js';
const router = Router();

router.get('/', getAdminDashboard);
router.post('/users', addNewUser);
router.get('/users', viewAllUsers);
router.delete('/users', deleteUser);
router.put('/users', updateUser);

export default router;