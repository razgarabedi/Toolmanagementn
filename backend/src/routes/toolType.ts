import { Router } from 'express';
import { createToolType, getToolTypes, deleteToolType, updateToolType } from '../controllers/toolType';
import { auth, authorize } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.post('/', [auth, authorize(['admin', 'manager']), upload.single('image')], createToolType as any);
router.get('/', auth, getToolTypes as any);
router.put('/:id', [auth, authorize(['admin', 'manager']), upload.single('image')], updateToolType as any);
router.delete('/:id', [auth, authorize(['admin'])], deleteToolType as any);

export default router; 