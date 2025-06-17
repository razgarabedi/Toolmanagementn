import { Request, Response } from 'express';
import { Booking, Tool, Notification, ToolType } from '../models';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';

export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { toolId, startDate, endDate } = req.body;
        const userId = req.user.id;

        const tool = await Tool.findByPk(toolId);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }

        const conflictingBooking = await Booking.findOne({
            where: {
                toolId,
                status: { [Op.ne]: 'cancelled' },
                [Op.or]: [
                    {
                        startDate: {
                            [Op.between]: [startDate, endDate],
                        },
                    },
                    {
                        endDate: {
                            [Op.between]: [startDate, endDate],
                        },
                    },
                ],
            },
        });

        if (conflictingBooking) {
            return res.status(409).json({ message: 'Tool is already booked for this period.' });
        }

        const booking = await Booking.create({
            toolId,
            userId,
            startDate,
            endDate,
            status: 'booked',
        });

        // Create a notification for the user
        await Notification.create({
            userId,
            message: `Your booking for tool #${toolId} from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()} has been confirmed.`
        });

        res.status(201).json(booking);
    } catch (error) {
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
        const bookings = await Booking.findAll({ 
            where: { status: {[Op.ne]: 'cancelled'} },
            include: ['tool', 'user'] 
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