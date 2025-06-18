import { Request, Response } from 'express';
import { Booking, Tool, Notification, ToolType, Maintenance } from '../models';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';

export const createBooking = async (req: AuthRequest, res: Response) => {
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

        const tool = await Tool.findByPk(toolId);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        const requestedStartDate = new Date(startDate);
        const requestedEndDate = new Date(endDate);

        if (requestedStartDate >= requestedEndDate) {
            return res.status(400).json({ message: 'End date must be after start date.' });
        }

        // Check for conflicting bookings
        const conflictingBooking = await Booking.findOne({
            where: {
                toolId,
                status: { [Op.in]: ['pending', 'approved', 'active'] },
                startDate: { [Op.lt]: requestedEndDate },
                endDate: { [Op.gt]: requestedStartDate }
            },
        });

        if (conflictingBooking) {
            return res.status(409).json({ message: 'Tool is already booked or has a pending request for this period.' });
        }

        // Check for conflicting maintenances
        const conflictingMaintenance = await Maintenance.findOne({
            where: {
                toolId,
                status: { [Op.notIn]: ['completed'] },
                startDate: { [Op.lt]: requestedEndDate },
                endDate: { [Op.gt]: requestedStartDate }
            }
        });

        if (conflictingMaintenance) {
            return res.status(409).json({ message: 'Tool is scheduled for maintenance during this period.' });
        }

        type BookingStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'completed' | 'cancelled';
        let finalStatus: BookingStatus = 'pending';

        if (status === 'active') {
            finalStatus = 'active'; // Direct checkout bypasses approval
        } else if (req.user.role === 'admin' || req.user.role === 'manager') {
            finalStatus = status || 'pending';
        }

        const booking = await Booking.create({
            toolId,
            userId,
            startDate: requestedStartDate,
            endDate: requestedEndDate,
            status: finalStatus,
        });

        let notificationMessage = `Your booking for tool #${toolId} from ${requestedStartDate.toLocaleDateString()} to ${requestedEndDate.toLocaleDateString()} has been submitted for approval.`;
        if (finalStatus === 'active') {
            notificationMessage = `You have checked out tool #${toolId} until ${requestedEndDate.toLocaleDateString()}.`;
        } else if (finalStatus === 'approved') {
            notificationMessage = `Your booking for tool #${toolId} has been approved.`;
        }

        // Create a notification for the user
        await Notification.create({
            userId,
            message: notificationMessage,
        });

        res.status(201).json(booking);
    } catch (error) {
        console.error("Error creating booking: ", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const getUserBookings = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const bookings = await Booking.findAll({ 
            where: { userId }, 
            include: [{ 
                model: Tool, 
                as: 'tool',
                include: [{ model: ToolType, as: 'toolType' }]
            }] 
        });
        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error in getUserBookings:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const getToolBookings = async (req: Request, res: Response) => {
    try {
        const { toolId } = req.params;
        const bookings = await Booking.findAll({ where: { toolId, status: {[Op.ne]: 'cancelled'} } });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const getAllBookings = async (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        const where: any = {};

        if (status) {
            where.status = status;
        }

        const bookings = await Booking.findAll({ 
            where,
            include: ['tool', 'user'],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const getOverdueBookings = async (req: Request, res: Response) => {
    try {
        const overdueBookings = await Booking.findAll({
            where: {
                status: 'active',
                endDate: {
                    [Op.lt]: new Date()
                }
            },
            include: [
                {
                    model: Tool,
                    as: 'tool',
                    include: [{ model: ToolType, as: 'toolType' }]
                },
                {
                    model: (Booking as any).sequelize.models.User,
                    as: 'user',
                    attributes: ['id', 'username']
                }
            ]
        });
        res.status(200).json(overdueBookings);
    } catch (error) {
        console.error("Error in getOverdueBookings:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const cancelBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const booking = await Booking.findByPk(id);

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
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const getMyBookings = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const bookings = await Booking.findAll({ 
            where: { userId },
            include: [{ model: Tool, include: ['toolType'] }] 
        });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user bookings', error });
    }
};

export const checkOutTool = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);

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
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const checkInTool = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);

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
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const approveBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be approved.' });
        }
        booking.status = 'approved';
        await booking.save();

        await Notification.create({
            userId: booking.userId,
            message: `Your booking for tool #${booking.toolId} has been approved.`
        });

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}

export const rejectBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByPk(id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending bookings can be rejected.' });
        }
        booking.status = 'rejected';
        await booking.save();

        await Notification.create({
            userId: booking.userId,
            message: `Your booking for tool #${booking.toolId} has been rejected.`
        });

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
} 