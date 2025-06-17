import { Router } from 'express';
import { createCategory, getCategories, deleteCategory } from '../controllers/category';
import { auth, authorize } from '../middleware/auth';

const router = Router();

router.post('/', [auth, authorize(['admin'])], createCategory as any);
router.get('/', auth, getCategories as any);
router.delete('/:id', [auth, authorize(['admin'])], deleteCategory as any);

export default router; 