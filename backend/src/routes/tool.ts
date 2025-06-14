import { Router } from 'express';
import { getTools, getTool, createTool, updateTool, deleteTool, checkoutTool, checkinTool, getMyCheckedOutTools } from '../controllers/tool';
import { auth, authorize } from '../middleware/auth';

const router = Router();

router.get('/', auth, getTools as any);
router.get('/my-tools', auth, getMyCheckedOutTools as any);
router.get('/:id', auth, getTool as any);
router.post('/', [auth, authorize(['admin', 'manager'])], createTool as any);
router.put('/:id', [auth, authorize(['admin', 'manager'])], updateTool as any);
router.delete('/:id', [auth, authorize(['admin', 'manager'])], deleteTool as any);
router.post('/:id/checkout', auth, checkoutTool as any);
router.post('/:id/checkin', auth, checkinTool as any);

export default router; 