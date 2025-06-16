"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_1 = require("../controllers/notification");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/my-notifications', auth_1.auth, notification_1.getMyNotifications);
router.patch('/:id/read', auth_1.auth, notification_1.markAsRead);
exports.default = router;
