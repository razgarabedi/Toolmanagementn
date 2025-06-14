import { Router } from 'express';
import { createBooking, getUserBookings, getToolBookings, cancelBooking, getAllBookings, getOverdueBookings } from '../controllers/booking';
import { auth, authorize } from '../middleware/auth';

const router = Router();

router.get('/', auth, getAllBookings);
router.get('/overdue', [auth, authorize(['admin', 'manager'])], getOverdueBookings);
router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getUserBookings);
router.get('/tool/:toolId', auth, getToolBookings);
router.put('/:id/cancel', auth, cancelBooking);

export default router; 