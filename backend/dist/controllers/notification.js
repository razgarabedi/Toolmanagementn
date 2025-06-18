"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAsRead = exports.getMyNotifications = void 0;
const models_1 = require("../models");
const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = await models_1.Notification.findAll({ where: { userId, isRead: false } });
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user notifications', error });
    }
};
exports.getMyNotifications = getMyNotifications;
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
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.markAsRead = markAsRead;
