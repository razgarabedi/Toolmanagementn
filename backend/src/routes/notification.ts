import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notification';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/my-notifications', auth, getMyNotifications);
router.put('/:id/read', auth, markAsRead);

export default router; 