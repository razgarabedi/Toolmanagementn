import cron from 'node-cron';
import { Booking, Notification } from '../models';
import { Op } from 'sequelize';
import i18n from '../i18n';

// Schedule a job to run every day at midnight
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily check for overdue bookings...');
    try {
        const overdueBookings = await Booking.findAll({
            where: {
                status: 'active',
                endDate: {
                    [Op.lt]: new Date()
                },
                overdueNotified: {
                    [Op.not]: true
                }
            },
            include: ['user', 'tool']
        });

        for (const booking of overdueBookings) {
            // @ts-ignore
            const toolName = booking.tool ? booking.tool.name : `ID: ${booking.toolId}`;
            // Notify user
            await Notification.create({
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
    } catch (error) {
        console.error('Error checking for overdue bookings:', error);
    }
}); 