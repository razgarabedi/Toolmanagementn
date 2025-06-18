"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectBooking = exports.approveBooking = exports.checkInTool = exports.checkOutTool = exports.getMyBookings = exports.cancelBooking = exports.getOverdueBookings = exports.getAllBookings = exports.getToolBookings = exports.getUserBookings = exports.createBooking = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const createBooking = async (req, res) => {
    try {
        const { toolId, startDate, endDate, userId: providedUserId, status } = req.body;
        let userId = req.user.id;
        // Admins/Managers can specify a user
        if (['admin', 'manager'].includes(req.user.role) && providedUserId) {
            userId = providedUserId;
        }
        if (!toolId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Tool ID, start date, and end date are required.' });
        }
        const tool = await models_1.Tool.findByPk(toolId);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        const requestedStartDate = new Date(startDate);
        const requestedEndDate = new Date(endDate);
        if (requestedStartDate >= requestedEndDate) {
            return res.status(400).json({ message: 'End date must be after start date.' });
        }
        // Check for conflicting bookings
        const conflictingBooking = await models_1.Booking.findOne({
            where: {
                toolId,
                status: { [sequelize_1.Op.in]: ['pending', 'approved', 'active'] },
                startDate: { [sequelize_1.Op.lt]: requestedEndDate },
                endDate: { [sequelize_1.Op.gt]: requestedStartDate }
            },
        });
        if (conflictingBooking) {
            return res.status(409).json({ message: 'Tool is already booked or has a pending request for this period.' });
        }
        // Check for conflicting maintenances
        const conflictingMaintenance = await models_1.Maintenance.findOne({
            where: {
                toolId,
                status: { [sequelize_1.Op.notIn]: ['completed'] },
                startDate: { [sequelize_1.Op.lt]: requestedEndDate },
                endDate: { [sequelize_1.Op.gt]: requestedStartDate }
            }
        });
        if (conflictingMaintenance) {
            return res.status(409).json({ message: 'Tool is scheduled for maintenance during this period.' });
        }
        let finalStatus = 'pending';
        if (status === 'active') {
            finalStatus = 'active'; // Direct checkout bypasses approval
        }
        else if (req.user.role === 'admin' || req.user.role === 'manager') {
            finalStatus = status || 'pending';
        }
        const booking = await models_1.Booking.create({
            toolId,
            userId,
            startDate: requestedStartDate,
            endDate: requestedEndDate,
            status: finalStatus,
        });
        let notificationMessage = `Your booking for tool #${toolId} from ${requestedStartDate.toLocaleDateString()} to ${requestedEndDate.toLocaleDateString()} has been submitted for approval.`;
        if (finalStatus === 'active') {
            notificationMessage = `You have checked out tool #${toolId} until ${requestedEndDate.toLocaleDateString()}.`;
        }
        else if (finalStatus === 'approved') {
            notificationMessage = `Your booking for tool #${toolId} has been approved.`;
        }
        // Create a notification for the user
        await models_1.Notification.create({
            userId,
            message: notificationMessage,
        });
        res.status(201).json(booking);
    }
    catch (error) {
        console.error("Error creating booking: ", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.createBooking = createBooking;
const getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await models_1.Booking.findAll({
            where: { userId },
            include: [{
                    model: models_1.Tool,
                    as: 'tool',
                    include: [{ model: models_1.ToolType, as: 'toolType' }]
                }]
        });
        res.status(200).json(bookings);
    }
    catch (error) {
        console.error("Error in getUserBookings:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getUserBookings = getUserBookings;
const getToolBookings = async (req, res) => {
    try {
        const { toolId } = req.params;
        const bookings = await models_1.Booking.findAll({ where: { toolId, status: { [sequelize_1.Op.ne]: 'cancelled' } } });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getToolBookings = getToolBookings;
const getAllBookings = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) {
            where.status = status;
        }
        const bookings = await models_1.Booking.findAll({
            where,
            include: ['tool', 'user'],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getAllBookings = getAllBookings;
const getOverdueBookings = async (req, res) => {
    try {
        const overdueBookings = await models_1.Booking.findAll({
            where: {
                status: 'active',
                endDate: {
                    [sequelize_1.Op.lt]: new Date()
                }
            },
            include: [
                {
                    model: models_1.Tool,
                    as: 'tool',
                    include: [{ model: models_1.ToolType, as: 'toolType' }]
                },
                {
                    model: models_1.Booking.sequelize.models.User,
                    as: 'user',
                    attributes: ['id', 'username']
                }
            ]
        });
        res.status(200).json(overdueBookings);
    }
    catch (error) {
        console.error("Error in getOverdueBookings:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getOverdueBookings = getOverdueBookings;
const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const booking = await models_1.Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({ message: 'You are not authorized to cancel this booking' });
        }
        if (booking.status !== 'pending' && booking.status !== 'approved') {
            return res.status(400).json({ message: 'Only pending or approved bookings can be cancelled.' });
        }
        booking.status = 'cancelled';
        await booking.save();
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.cancelBooking = cancelBooking;
const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const bookings = await models_1.Booking.findAll({
            where: { userId },
            include: [{ model: models_1.Tool, include: ['toolType'] }]
        });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user bookings', error });
    }
};
exports.getMyBookings = getMyBookings;
const checkOutTool = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await models_1.Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.userId !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status !== 'approved') {
            return res.status(400).json({ message: 'Tool can only be checked out if the booking is approved.' });
        }
        const now = new Date();
        if (new Date(booking.startDate) > now) {
            return res.status(400).json({ message: 'Cannot check out a tool before the booking start date.' });
        }
        booking.status = 'active';
        await booking.save();
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.checkOutTool = checkOutTool;
const checkInTool = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await models_1.Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.userId !== req.user.id && !['admin', 'manager'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status !== 'active') {
            return res.status(400).json({ message: 'Tool can only be checked in if it is active.' });
        }
        booking.status = 'completed';
        await booking.save();
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.checkInTool = checkInTool;
const approveBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await models_1.Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be approved.' });
        }
        booking.status = 'approved';
        await booking.save();
        await models_1.Notification.create({
            userId: booking.userId,
            message: `Your booking for tool #${booking.toolId} has been approved.`
        });
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.approveBooking = approveBooking;
const rejectBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await models_1.Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be rejected.' });
        }
        booking.status = 'rejected';
        await booking.save();
        await models_1.Notification.create({
            userId: booking.userId,
            message: `Your booking for tool #${booking.toolId} has been rejected.`
        });
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.rejectBooking = rejectBooking;
