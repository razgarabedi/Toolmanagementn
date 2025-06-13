import { Router } from 'express';
import { getTools, getTool, createTool, updateTool, deleteTool, checkoutTool, checkinTool } from '../controllers/tool';
import { authorize } from '../middleware/auth';

const router = Router();

router.get('/', getTools as any);
router.get('/:id', getTool as any);
router.post('/', authorize(['admin']), createTool as any);
router.put('/:id', authorize(['admin']), updateTool as any);
router.delete('/:id', authorize(['admin']), deleteTool as any);
router.post('/:id/checkout', checkoutTool as any);
router.post('/:id/checkin', checkinTool as any);

export default router; 