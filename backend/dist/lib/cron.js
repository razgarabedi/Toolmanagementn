"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
// Schedule a job to run every day at midnight
node_cron_1.default.schedule('0 0 * * *', async () => {
    console.log('Running daily check for overdue bookings...');
    try {
        const overdueBookings = await models_1.Booking.findAll({
            where: {
                status: 'active',
                endDate: {
                    [sequelize_1.Op.lt]: new Date()
                },
                overdueNotified: {
                    [sequelize_1.Op.not]: true
                }
            },
            include: ['user', 'tool']
        });
        for (const booking of overdueBookings) {
            // @ts-ignore
            const toolName = booking.tool ? booking.tool.name : `ID: ${booking.toolId}`;
            // Notify user
            await models_1.Notification.create({
                userId: booking.userId,
                toolId: booking.toolId,
                messageKey: 'bookingOverdue',
                messagePayload: {
                    // @ts-ignore
                    username: booking.user.username,
                    toolName
                }
            });
            // Optionally, notify managers/admins
            // This requires a way to get all managers/admins
            // Mark the booking as notified to prevent duplicate notifications
            booking.set('overdueNotified', true);
            await booking.save();
        }
    }
    catch (error) {
        console.error('Error checking for overdue bookings:', error);
    }
});
