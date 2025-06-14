import { Request, Response } from 'express';
import { Notification } from '../models';
import { AuthRequest } from '../middleware/auth';

export const getMyNotifications = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user.id;
        const notifications = await Notification.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
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
        res.status(500).json({ message: 'Something went wrong' });
    }
}; 