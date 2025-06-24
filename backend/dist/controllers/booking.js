"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectBooking = exports.approveBooking = exports.checkInTool = exports.checkOutTool = exports.getMyBookings = exports.cancelBooking = exports.getOverdueBookings = exports.getAllBookings = exports.getToolBookings = exports.getUserBookings = exports.createBooking = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const index_1 = require("../index");
const createBooking = async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    try {
        const { toolId, startDate, endDate, userId: providedUserId, status, notes } = req.body;
        let userId = req.user.id;
        // Admins/Managers can specify a user
        if (['admin', 'manager'].includes(req.user.role) && providedUserId) {
            userId = providedUserId;
        }
        if (!toolId || !startDate || !endDate) {
            return res.status(400).json({ message: 'Tool ID, start date, and end date are required.' });
        }
        // Fetch tool with associations
        const tool = await models_1.Tool.findByPk(toolId, {
            include: [
                { model: models_1.ToolType, as: 'toolType' },
                { model: models_1.Location, as: 'location' },
                { model: models_1.Manufacturer, as: 'manufacturer' }
            ]
        });
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
            notes,
        });
        // Fetch user for username
        const user = await (await Promise.resolve().then(() => __importStar(require('../models/user')))).default.findByPk(userId);
        // Determine language (default to 'en', can be extended to get from user profile)
        const lang = ((_a = req.headers['accept-language']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) || 'en';
        let messageKey = 'bookingSubmitted';
        let messagePayload = {
            toolName: tool.name,
            serialNumber: tool.serialNumber,
            rfid: tool.rfid,
            toolType: (_b = tool.toolType) === null || _b === void 0 ? void 0 : _b.name,
            location: (_c = tool.location) === null || _c === void 0 ? void 0 : _c.name,
            manufacturer: (_d = tool.manufacturer) === null || _d === void 0 ? void 0 : _d.name,
            username: user === null || user === void 0 ? void 0 : user.username,
            startDate: requestedStartDate.toLocaleDateString(lang),
            endDate: requestedEndDate.toLocaleDateString(lang)
        };
        if (finalStatus === 'active') {
            messageKey = 'toolCheckedOut';
            messagePayload = {
                toolName: tool.name,
                serialNumber: tool.serialNumber,
                rfid: tool.rfid,
                toolType: (_e = tool.toolType) === null || _e === void 0 ? void 0 : _e.name,
                location: (_f = tool.location) === null || _f === void 0 ? void 0 : _f.name,
                manufacturer: (_g = tool.manufacturer) === null || _g === void 0 ? void 0 : _g.name,
                username: user === null || user === void 0 ? void 0 : user.username,
                endDate: requestedEndDate.toLocaleDateString(lang)
            };
        }
        else if (finalStatus === 'approved') {
            messageKey = 'bookingApproved';
            messagePayload = {
                toolName: tool.name,
                serialNumber: tool.serialNumber,
                rfid: tool.rfid,
                toolType: (_h = tool.toolType) === null || _h === void 0 ? void 0 : _h.name,
                location: (_j = tool.location) === null || _j === void 0 ? void 0 : _j.name,
                manufacturer: (_k = tool.manufacturer) === null || _k === void 0 ? void 0 : _k.name,
                username: user === null || user === void 0 ? void 0 : user.username
            };
        }
        // Create a notification for the user
        const notification = await models_1.Notification.create({
            userId,
            toolId,
            messageKey,
            messagePayload
        });
        // Emit notification event to the user
        index_1.io.to(`user_${userId}`).emit('notification', notification);
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
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const bookings = await models_1.Booking.findAll({
            where: {
                userId,
                createdAt: { [sequelize_1.Op.gte]: oneMonthAgo }
            },
            order: [['createdAt', 'DESC']],
            include: [{
                    model: models_1.Tool,
                    as: 'tool',
                    attributes: ['id', 'name', 'condition'],
                    include: ['toolType']
                }]
        });
        res.status(200).json(bookings);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user bookings', error });
    }
};
exports.getMyBookings = getMyBookings;
const checkOutTool = async (req, res) => {
    var _a, _b, _c, _d;
    try {
        const { id } = req.params;
        const booking = await models_1.Booking.findByPk(id, { include: ['tool', 'user'] });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.status !== 'approved') {
            return res.status(400).json({ message: 'Only approved bookings can be checked out.' });
        }
        booking.status = 'active';
        await booking.save();
        // Fetch tool with associations
        const tool = await models_1.Tool.findByPk(booking.toolId, {
            include: [
                { model: models_1.ToolType, as: 'toolType' },
                { model: models_1.Location, as: 'location' },
                { model: models_1.Manufacturer, as: 'manufacturer' }
            ]
        });
        const user = booking.user;
        const lang = ((_a = req.headers['accept-language']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) || 'en';
        const notification = await models_1.Notification.create({
            userId: booking.userId,
            toolId: booking.toolId,
            messageKey: 'toolCheckedOut',
            messagePayload: {
                toolName: tool === null || tool === void 0 ? void 0 : tool.name,
                serialNumber: tool === null || tool === void 0 ? void 0 : tool.serialNumber,
                rfid: tool === null || tool === void 0 ? void 0 : tool.rfid,
                toolType: (_b = tool === null || tool === void 0 ? void 0 : tool.toolType) === null || _b === void 0 ? void 0 : _b.name,
                location: (_c = tool === null || tool === void 0 ? void 0 : tool.location) === null || _c === void 0 ? void 0 : _c.name,
                manufacturer: (_d = tool === null || tool === void 0 ? void 0 : tool.manufacturer) === null || _d === void 0 ? void 0 : _d.name,
                username: user === null || user === void 0 ? void 0 : user.username,
                endDate: booking.endDate.toLocaleDateString(lang)
            }
        });
        index_1.io.to(`user_${booking.userId}`).emit('notification', notification);
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.checkOutTool = checkOutTool;
const checkInTool = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { condition, notes } = req.body;
        if (!condition) {
            return res.status(400).json({ message: 'Condition on return is required.' });
        }
        const booking = await models_1.Booking.findByPk(id, { include: ['tool'] });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.status !== 'active') {
            return res.status(400).json({ message: 'Only active bookings can be checked in.' });
        }
        // Check authorization: user who booked, admin or manager
        if (booking.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'manager') {
            return res.status(403).json({ message: 'You are not authorized to check in this tool.' });
        }
        const tool = await models_1.Tool.findByPk(booking.toolId);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        booking.status = 'completed';
        booking.conditionOnReturn = condition;
        booking.checkinNotes = notes;
        tool.status = 'available';
        tool.condition = condition;
        tool.currentOwnerId = undefined;
        await booking.save();
        await tool.save();
        const user = await (await Promise.resolve().then(() => __importStar(require('../models/user')))).default.findByPk(booking.userId);
        const lang = ((_a = req.headers['accept-language']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) || 'en';
        const notification = await models_1.Notification.create({
            userId: booking.userId,
            toolId: booking.toolId,
            messageKey: 'toolCheckedIn',
            messagePayload: {
                toolName: tool.name,
                username: user === null || user === void 0 ? void 0 : user.username
            }
        });
        index_1.io.to(`user_${booking.userId}`).emit('notification', notification);
        res.status(200).json({ message: 'Tool checked in successfully' });
    }
    catch (error) {
        console.error("Error checking in tool:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.checkInTool = checkInTool;
const approveBooking = async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
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
        // Fetch user for username
        const user = await (await Promise.resolve().then(() => __importStar(require('../models/user')))).default.findByPk(booking.userId);
        // Fetch tool with associations
        const tool = await models_1.Tool.findByPk(booking.toolId, {
            include: [
                { model: models_1.ToolType, as: 'toolType' },
                { model: models_1.Location, as: 'location' },
                { model: models_1.Manufacturer, as: 'manufacturer' }
            ]
        });
        await models_1.Notification.create({
            userId: booking.userId,
            toolId: booking.toolId,
            messageKey: 'bookingApproved',
            messagePayload: {
                toolName: tool === null || tool === void 0 ? void 0 : tool.name,
                serialNumber: tool === null || tool === void 0 ? void 0 : tool.serialNumber,
                rfid: tool === null || tool === void 0 ? void 0 : tool.rfid,
                toolType: (_a = tool === null || tool === void 0 ? void 0 : tool.toolType) === null || _a === void 0 ? void 0 : _a.name,
                location: (_b = tool === null || tool === void 0 ? void 0 : tool.location) === null || _b === void 0 ? void 0 : _b.name,
                manufacturer: (_c = tool === null || tool === void 0 ? void 0 : tool.manufacturer) === null || _c === void 0 ? void 0 : _c.name,
                username: user === null || user === void 0 ? void 0 : user.username
            }
        });
        const notificationData = {
            userId: booking.userId,
            messageKey: 'bookingApproved',
            messagePayload: {
                toolName: tool === null || tool === void 0 ? void 0 : tool.name,
                serialNumber: tool === null || tool === void 0 ? void 0 : tool.serialNumber,
                rfid: tool === null || tool === void 0 ? void 0 : tool.rfid,
                toolType: (_d = tool === null || tool === void 0 ? void 0 : tool.toolType) === null || _d === void 0 ? void 0 : _d.name,
                location: (_e = tool === null || tool === void 0 ? void 0 : tool.location) === null || _e === void 0 ? void 0 : _e.name,
                manufacturer: (_f = tool === null || tool === void 0 ? void 0 : tool.manufacturer) === null || _f === void 0 ? void 0 : _f.name,
                username: user === null || user === void 0 ? void 0 : user.username
            },
            isRead: false,
            createdAt: new Date()
        };
        index_1.io.to(`user_${booking.userId}`).emit('notification', notificationData);
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.approveBooking = approveBooking;
const rejectBooking = async (req, res) => {
    var _a, _b, _c, _d, _e, _f;
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
        // Fetch user for username
        const user = await (await Promise.resolve().then(() => __importStar(require('../models/user')))).default.findByPk(booking.userId);
        // Fetch tool with associations
        const tool = await models_1.Tool.findByPk(booking.toolId, {
            include: [
                { model: models_1.ToolType, as: 'toolType' },
                { model: models_1.Location, as: 'location' },
                { model: models_1.Manufacturer, as: 'manufacturer' }
            ]
        });
        await models_1.Notification.create({
            userId: booking.userId,
            toolId: booking.toolId,
            messageKey: 'bookingRejected',
            messagePayload: {
                toolName: tool === null || tool === void 0 ? void 0 : tool.name,
                serialNumber: tool === null || tool === void 0 ? void 0 : tool.serialNumber,
                rfid: tool === null || tool === void 0 ? void 0 : tool.rfid,
                toolType: (_a = tool === null || tool === void 0 ? void 0 : tool.toolType) === null || _a === void 0 ? void 0 : _a.name,
                location: (_b = tool === null || tool === void 0 ? void 0 : tool.location) === null || _b === void 0 ? void 0 : _b.name,
                manufacturer: (_c = tool === null || tool === void 0 ? void 0 : tool.manufacturer) === null || _c === void 0 ? void 0 : _c.name,
                username: user === null || user === void 0 ? void 0 : user.username
            }
        });
        const notificationData = {
            userId: booking.userId,
            messageKey: 'bookingRejected',
            messagePayload: {
                toolName: tool === null || tool === void 0 ? void 0 : tool.name,
                serialNumber: tool === null || tool === void 0 ? void 0 : tool.serialNumber,
                rfid: tool === null || tool === void 0 ? void 0 : tool.rfid,
                toolType: (_d = tool === null || tool === void 0 ? void 0 : tool.toolType) === null || _d === void 0 ? void 0 : _d.name,
                location: (_e = tool === null || tool === void 0 ? void 0 : tool.location) === null || _e === void 0 ? void 0 : _e.name,
                manufacturer: (_f = tool === null || tool === void 0 ? void 0 : tool.manufacturer) === null || _f === void 0 ? void 0 : _f.name,
                username: user === null || user === void 0 ? void 0 : user.username
            },
            isRead: false,
            createdAt: new Date()
        };
        index_1.io.to(`user_${booking.userId}`).emit('notification', notificationData);
        res.status(200).json(booking);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.rejectBooking = rejectBooking;
