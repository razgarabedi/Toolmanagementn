import { Router } from 'express';
import { getTools, getTool, createTool, updateTool, deleteTool, checkoutTool, checkinTool, getMyTools } from '../controllers/tool';
import { auth, authorize } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.get('/', auth, getTools as any);
router.get('/my-tools', auth, getMyTools);
router.get('/:id', auth, getTool as any);
router.post('/', [auth, authorize(['admin', 'manager']), upload.fields([{ name: 'instanceImage', maxCount: 1 }, { name: 'attachments' }])], createTool as any);
router.put('/:id', [auth, authorize(['admin', 'manager']), upload.fields([{ name: 'instanceImage', maxCount: 1 }, { name: 'attachments' }])], updateTool as any);
router.delete('/:id', [auth, authorize(['admin', 'manager'])], deleteTool as any);
router.post('/:id/checkout', auth, checkoutTool as any);
router.post('/:id/checkin', auth, checkinTool as any);

export default router; 