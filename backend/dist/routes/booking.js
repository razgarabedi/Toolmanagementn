"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_1 = require("../controllers/booking");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, booking_1.getAllBookings);
router.get('/overdue', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager'])], booking_1.getOverdueBookings);
router.post('/', auth_1.auth, booking_1.createBooking);
router.get('/my-bookings', auth_1.auth, booking_1.getUserBookings);
router.get('/tool/:toolId', auth_1.auth, booking_1.getToolBookings);
router.put('/:id/cancel', auth_1.auth, booking_1.cancelBooking);
exports.default = router;
