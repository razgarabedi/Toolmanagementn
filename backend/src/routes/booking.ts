import { Router } from 'express';
import { createBooking, getUserBookings, getToolBookings, cancelBooking, getAllBookings, getOverdueBookings, getMyBookings, checkOutTool, checkInTool, approveBooking, rejectBooking } from '../controllers/booking';
import { auth, authorize } from '../middleware/auth';

const router = Router();
const adminAndManager = authorize(['admin', 'manager']);

router.get('/', auth, getAllBookings);
router.get('/overdue', [auth, adminAndManager], getOverdueBookings);
router.post('/', auth, createBooking);
router.get('/my-bookings', auth, getMyBookings);
router.get('/tool/:toolId', auth, getToolBookings);
router.put('/:id/cancel', auth, cancelBooking);
router.put('/:id/checkout', auth, checkOutTool);
router.put('/:id/checkin', auth, checkInTool);
router.put('/:id/approve', [auth, adminAndManager], approveBooking);
router.put('/:id/reject', [auth, adminAndManager], rejectBooking);

export default router; 