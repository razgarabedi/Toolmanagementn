import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notification';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/my-notifications', auth, getMyNotifications as any);
router.patch('/:id/read', auth, markAsRead as any);

export default router; 