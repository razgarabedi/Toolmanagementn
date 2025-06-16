import { Router } from 'express';
import { createCategory, getCategories } from '../controllers/category';
import { auth, authorize } from '../middleware/auth';

const router = Router();

router.post('/', [auth, authorize(['admin'])], createCategory as any);
router.get('/', auth, getCategories as any);

export default router; 