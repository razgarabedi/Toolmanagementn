import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/user';
import { auth, authorize } from '../middleware/auth';

const router = Router();

router.get('/', [auth, authorize(['admin'])], getUsers);
router.put('/:id/role', [auth, authorize(['admin'])], updateUserRole);

export default router; 