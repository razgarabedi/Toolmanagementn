"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAllNotifications = exports.markAllAsRead = exports.markAsRead = exports.getUnreadNotifications = exports.getAllNotifications = void 0;
const models_1 = require("../models");
const getAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await models_1.Notification.findAll({
            where: { userId },
            include: [
                {
                    model: models_1.User,
                    as: 'user',
                    attributes: ['username']
                },
                {
                    model: models_1.Tool,
                    as: 'tool',
                    include: [
                        {
                            model: models_1.ToolType,
                            as: 'toolType',
                            attributes: ['name']
                        },
                        {
                            model: models_1.Location,
                            as: 'location',
                            attributes: ['name']
                        },
                        {
                            model: models_1.Manufacturer,
                            as: 'manufacturer',
                            attributes: ['name']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        console.error("Error fetching user notifications:", error);
        res.status(500).json({ message: 'Error fetching user notifications', error });
    }
};
exports.getAllNotifications = getAllNotifications;
const getUnreadNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await models_1.Notification.findAll({
            where: { userId, isRead: false },
            include: [
                {
                    model: models_1.User,
                    as: 'user',
                    attributes: ['username']
                },
                {
                    model: models_1.Tool,
                    as: 'tool',
                    include: [
                        {
                            model: models_1.ToolType,
                            as: 'toolType',
                            attributes: ['name']
                        },
                        {
                            model: models_1.Location,
                            as: 'location',
                            attributes: ['name']
                        },
                        {
                            model: models_1.Manufacturer,
                            as: 'manufacturer',
                            attributes: ['name']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json(notifications);
    }
    catch (error) {
        console.error("Error fetching unread notifications:", error);
        res.status(500).json({ message: 'Error fetching user notifications', error });
    }
};
exports.getUnreadNotifications = getUnreadNotifications;
const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const notification = await models_1.Notification.findOne({ where: { id, userId } });
        if (notification) {
            notification.isRead = true;
            await notification.save();
            res.status(200).json(notification);
        }
        else {
            res.status(404).json({ message: 'Notification not found' });
        }
    }
    catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await models_1.Notification.update({ isRead: true }, { where: { userId, isRead: false } });
        res.status(200).json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error("Error marking all notifications as read:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.markAllAsRead = markAllAsRead;
const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        await models_1.Notification.destroy({ where: { userId } });
        res.status(200).json({ message: 'All notifications cleared' });
    }
    catch (error) {
        console.error("Error clearing all notifications:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.clearAllNotifications = clearAllNotifications;
