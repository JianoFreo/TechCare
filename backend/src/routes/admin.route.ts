import { Router } from 'express';
import { 
    getAllUsers,
    addNewUser,
    viewAllUsers,
    deleteUser,
    updateUser
} from '../controllers/admin.controller.js';
const router = Router();

router.get('/', getAllUsers);
router.post('/users', addNewUser);
router.get('/users', viewAllUsers);
router.delete('/users', deleteUser);
router.put('/users', updateUser);

export default router;