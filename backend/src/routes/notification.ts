import { Router } from 'express';
import { getAllNotifications, getUnreadNotifications, markAsRead, markAllAsRead, clearAllNotifications } from '../controllers/notification';
import { auth } from '../middleware/auth';

const router = Router();

router.get('/all', auth, getAllNotifications);
router.get('/unread', auth, getUnreadNotifications);
router.put('/read-all', auth, markAllAsRead);
router.delete('/clear-all', auth, clearAllNotifications);
router.put('/:id/read', auth, markAsRead);

export default router; 