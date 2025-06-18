import { Request, Response } from 'express';
import { Notification, Tool, User, ToolType, Location, Manufacturer } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getAllNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const notifications = await Notification.findAll({
            where: { userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username']
                },
                {
                    model: Tool,
                    as: 'tool',
                    include: [
                        {
                            model: ToolType,
                            as: 'toolType',
                            attributes: ['name']
                        },
                        {
                            model: Location,
                            as: 'location',
                            attributes: ['name']
                        },
                        {
                            model: Manufacturer,
                            as: 'manufacturer',
                            attributes: ['name']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching user notifications:", error);
        res.status(500).json({ message: 'Error fetching user notifications', error });
    }
};

export const getUnreadNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const notifications = await Notification.findAll({
            where: { userId, isRead: false },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['username']
                },
                {
                    model: Tool,
                    as: 'tool',
                    include: [
                        {
                            model: ToolType,
                            as: 'toolType',
                            attributes: ['name']
                        },
                        {
                            model: Location,
                            as: 'location',
                            attributes: ['name']
                        },
                        {
                            model: Manufacturer,
                            as: 'manufacturer',
                            attributes: ['name']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(notifications);
    } catch (error) {
        console.error("Error fetching unread notifications:", error);
        res.status(500).json({ message: 'Error fetching user notifications', error });
    }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const notification = await Notification.findOne({ where: { id, userId } });
        if (notification) {
            notification.isRead = true;
            await notification.save();
            res.status(200).json(notification);
        } else {
            res.status(404).json({ message: 'Notification not found' });
        }
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

export const clearAllNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        await Notification.destroy({ where: { userId } });
        res.status(200).json({ message: 'All notifications cleared' });
    } catch (error) {
        console.error("Error clearing all notifications:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
