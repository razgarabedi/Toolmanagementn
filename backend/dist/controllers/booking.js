"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelBooking = exports.getOverdueBookings = exports.getAllBookings = exports.getToolBookings = exports.getUserBookings = exports.createBooking = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { toolId, startDate, endDate } = req.body;
        const userId = req.user.id;
        const tool = yield models_1.Tool.findByPk(toolId);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        const conflictingBooking = yield models_1.Booking.findOne({
            where: {
                toolId,
                status: { [sequelize_1.Op.ne]: 'cancelled' },
                [sequelize_1.Op.or]: [
                    {
                        startDate: {
                            [sequelize_1.Op.between]: [startDate, endDate],
                        },
                    },
                    {
                        endDate: {
                            [sequelize_1.Op.between]: [startDate, endDate],
                        },
                    },
                ],
            },
        });
        if (conflictingBooking) {
            return res.status(409).json({ message: 'Tool is already booked for this period.' });
        }
        const booking = yield models_1.Booking.create({
            toolId,
            userId,
            startDate,
            endDate,
            status: 'booked',
        });
        // Create a notification for the user
        yield models_1.Notification.create({
            userId,
            message: `Your booking for tool #${toolId} from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} has been confirmed.`
        });
        res.status(201).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.createBooking = createBooking;
const getUserBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const bookings = yield models_1.Booking.findAll({
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
});
exports.getUserBookings = getUserBookings;
const getToolBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { toolId } = req.params;
        const bookings = yield models_1.Booking.findAll({ where: { toolId, status: { [sequelize_1.Op.ne]: 'cancelled' } } });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getToolBookings = getToolBookings;
const getAllBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookings = yield models_1.Booking.findAll({
            where: { status: { [sequelize_1.Op.ne]: 'cancelled' } },
            include: ['tool', 'user']
        });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getAllBookings = getAllBookings;
const getOverdueBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const overdueBookings = yield models_1.Booking.findAll({
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
});
exports.getOverdueBookings = getOverdueBookings;
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const booking = yield models_1.Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.userId !== userId && req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({ message: 'You are not authorized to cancel this booking' });
        }
        booking.status = 'cancelled';
        yield booking.save();
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.cancelBooking = cancelBooking;
