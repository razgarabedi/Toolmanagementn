"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTools = exports.getMyCheckedOutTools = exports.checkinTool = exports.checkoutTool = exports.deleteTool = exports.updateTool = exports.getTool = exports.getTools = exports.createTool = exports.getToolTypes = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const getToolTypes = async (req, res) => {
    try {
        const toolTypes = await models_1.ToolType.findAll({
            include: [{
                    model: models_1.Tool,
                    as: 'instances',
                    include: [
                        { model: models_1.User, as: 'currentOwner', attributes: ['id', 'username'] }
                    ]
                }],
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(toolTypes);
    }
    catch (error) {
        console.error("Error fetching tool types:", error);
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.getToolTypes = getToolTypes;
const createTool = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { toolTypeId, rfid, serialNumber, condition, purchaseDate, cost, warrantyEndDate, locationId, manufacturerId, description, name } = req.body;
        const files = req.files;
        const instanceImage = (files === null || files === void 0 ? void 0 : files.instanceImage) ? files.instanceImage[0].path : undefined;
        if (!toolTypeId) {
            return res.status(400).json({
                message: "Validation Error",
                errors: [{ field: 'toolTypeId', message: 'A tool type is required.' }]
            });
        }
        const tool = await models_1.Tool.create({
            toolTypeId: parseInt(toolTypeId, 10),
            rfid,
            serialNumber,
            condition,
            purchaseDate: (purchaseDate && !isNaN(new Date(purchaseDate).getTime())) ? purchaseDate : null,
            cost: (cost && !isNaN(parseFloat(cost))) ? parseFloat(cost) : null,
            warrantyEndDate: (warrantyEndDate && !isNaN(new Date(warrantyEndDate).getTime())) ? warrantyEndDate : null,
            locationId: (locationId && !isNaN(parseInt(locationId, 10))) ? parseInt(locationId, 10) : null,
            manufacturerId: (manufacturerId && !isNaN(parseInt(manufacturerId, 10))) ? parseInt(manufacturerId, 10) : null,
            description,
            name,
            instanceImage,
        }, { transaction: t });
        if (files === null || files === void 0 ? void 0 : files.attachments) {
            const attachments = files.attachments.map(file => ({
                fileName: file.originalname,
                filePath: file.path,
                toolId: tool.id
            }));
            await models_1.Attachment.bulkCreate(attachments, { transaction: t });
        }
        await t.commit();
        const result = await models_1.Tool.findByPk(tool.id, { include: ['attachments', 'manufacturer'] });
        res.status(201).json(result);
    }
    catch (error) {
        await t.rollback();
        if (error instanceof sequelize_1.ValidationError || error instanceof sequelize_1.UniqueConstraintError) {
            return res.status(400).json({
                message: "Validation Error",
                errors: error.errors.map((e) => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            const field = error.fields[0] || 'unknown_field';
            return res.status(400).json({
                message: "Validation Error",
                errors: [{
                        field: field,
                        message: `Referenced entity for ${field} does not exist.`
                    }]
            });
        }
        console.error("Error creating tool:", error);
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating tool', error });
    }
};
exports.createTool = createTool;
const calculateToolStatus = (tool) => {
    var _a, _b, _c, _d;
    const now = new Date();
    const hasActiveMaintenance = (_a = tool.maintenances) === null || _a === void 0 ? void 0 : _a.some(m => m.status === 'in_progress');
    if (hasActiveMaintenance)
        return 'in_maintenance';
    const hasActiveBooking = (_b = tool.bookings) === null || _b === void 0 ? void 0 : _b.some(b => b.status === 'active');
    if (hasActiveBooking)
        return 'in_use';
    const hasUpcomingOrPendingBooking = (_c = tool.bookings) === null || _c === void 0 ? void 0 : _c.some(b => (b.status === 'approved' && new Date(b.startDate) > now) ||
        b.status === 'pending');
    if (hasUpcomingOrPendingBooking)
        return 'booked';
    const hasUpcomingMaintenance = (_d = tool.maintenances) === null || _d === void 0 ? void 0 : _d.some(m => m.status === 'scheduled');
    if (hasUpcomingMaintenance)
        return 'in_maintenance';
    return 'available';
};
const getTools = async (req, res) => {
    try {
        const { search } = req.query;
        const where = {};
        if (search) {
            where[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: `%${search}%` } },
                { description: { [sequelize_1.Op.like]: `%${search}%` } },
                { rfid: { [sequelize_1.Op.like]: `%${search}%` } },
                { serialNumber: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        const tools = await models_1.Tool.findAll({
            where,
            include: [
                { model: models_1.Location, as: 'location' },
                { model: models_1.ToolType, as: 'toolType', include: [{ model: models_1.Category, as: 'category' }] },
                { model: models_1.Booking, as: 'bookings', required: false },
                { model: models_1.Maintenance, as: 'maintenances', required: false }
            ],
            order: [['name', 'ASC']]
        });
        const toolsWithStatus = tools.map(tool => {
            var _a;
            const toolJson = tool.toJSON();
            toolJson.status = calculateToolStatus(tool);
            const activeBooking = (_a = toolJson.bookings) === null || _a === void 0 ? void 0 : _a.find((b) => b.status === 'active');
            toolJson.activeBooking = activeBooking ? { id: activeBooking.id } : null;
            return toolJson;
        });
        res.status(200).json(toolsWithStatus);
    }
    catch (error) {
        console.error("Error in getTools:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getTools = getTools;
const getTool = async (req, res) => {
    try {
        const { id } = req.params;
        const tool = await models_1.Tool.findByPk(id, {
            include: [
                { model: models_1.ToolType, as: 'toolType' },
                { model: models_1.User, as: 'currentOwner', attributes: ['id', 'username'] },
                { model: models_1.Booking, as: 'bookings' },
                { model: models_1.Maintenance, as: 'maintenances' },
                { model: models_1.Location, as: 'location', attributes: ['id', 'name'] },
                { model: models_1.Manufacturer, as: 'manufacturer', attributes: ['id', 'name'] },
                { model: models_1.Attachment, as: 'attachments' }
            ]
        });
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        const toolJson = tool.toJSON();
        toolJson.status = calculateToolStatus(tool);
        res.status(200).json(toolJson);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getTool = getTool;
const updateTool = async (req, res) => {
    const { id } = req.params;
    const t = await db_1.default.transaction();
    try {
        const { toolTypeId, rfid, serialNumber, condition, purchaseDate, cost, warrantyEndDate, locationId, manufacturerId, description, name } = req.body;
        const tool = await models_1.Tool.findByPk(id, { transaction: t });
        if (!tool) {
            await t.rollback();
            return res.status(404).json({ message: 'Tool not found' });
        }
        const files = req.files;
        const instanceImage = (files === null || files === void 0 ? void 0 : files.instanceImage) ? files.instanceImage[0].path : tool.instanceImage;
        if (!toolTypeId) {
            return res.status(400).json({
                message: "Validation Error",
                errors: [{ field: 'toolTypeId', message: 'A tool type is required.' }]
            });
        }
        await tool.update({
            toolTypeId: parseInt(toolTypeId, 10),
            rfid,
            serialNumber,
            condition,
            purchaseDate: (purchaseDate && !isNaN(new Date(purchaseDate).getTime())) ? purchaseDate : null,
            cost: (cost && !isNaN(parseFloat(cost))) ? parseFloat(cost) : null,
            warrantyEndDate: (warrantyEndDate && !isNaN(new Date(warrantyEndDate).getTime())) ? warrantyEndDate : null,
            locationId: (locationId && !isNaN(parseInt(locationId, 10))) ? parseInt(locationId, 10) : null,
            manufacturerId: (manufacturerId && !isNaN(parseInt(manufacturerId, 10))) ? parseInt(manufacturerId, 10) : null,
            description,
            name,
            instanceImage
        }, { transaction: t });
        if (files === null || files === void 0 ? void 0 : files.attachments) {
            await models_1.Attachment.destroy({ where: { toolId: id }, transaction: t });
            const attachments = files.attachments.map(file => ({
                fileName: file.originalname,
                filePath: file.path,
                toolId: tool.id
            }));
            await models_1.Attachment.bulkCreate(attachments, { transaction: t });
        }
        await t.commit();
        const updatedTool = await models_1.Tool.findByPk(id, { include: ['attachments', 'manufacturer'] });
        res.status(200).json(updatedTool);
    }
    catch (error) {
        await t.rollback();
        console.error("Error updating tool:", error);
        if (error instanceof sequelize_1.ValidationError || error instanceof sequelize_1.UniqueConstraintError) {
            return res.status(400).json({
                message: "Validation Error",
                errors: error.errors.map((e) => ({
                    field: e.path,
                    message: e.message
                }))
            });
        }
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            const field = error.fields[0] || 'unknown_field';
            return res.status(400).json({
                message: "Validation Error",
                errors: [{
                        field: field,
                        message: `Referenced entity for ${field} does not exist.`
                    }]
            });
        }
        console.error("Full error object:", JSON.stringify(error, null, 2));
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({
            message: 'Error updating tool',
            error: error.message,
            stack: error.stack
        });
    }
};
exports.updateTool = updateTool;
const deleteTool = async (req, res) => {
    try {
        const { id } = req.params;
        const tool = await models_1.Tool.findByPk(id);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        await tool.destroy();
        res.status(204).json({ message: 'Tool deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.deleteTool = deleteTool;
const checkoutTool = async (req, res) => {
    var _a, _b;
    const { id } = req.params;
    const userId = req.user.id;
    const t = await db_1.default.transaction();
    try {
        const tool = await models_1.Tool.findByPk(id, {
            include: [
                { model: models_1.Booking, as: 'bookings' },
                { model: models_1.Maintenance, as: 'maintenances' }
            ],
            transaction: t
        });
        if (!tool) {
            await t.rollback();
            return res.status(404).json({ message: 'Tool not found' });
        }
        const toolStatus = calculateToolStatus(tool);
        if (toolStatus !== 'available') {
            await t.rollback();
            return res.status(400).json({ message: `Tool is not available for checkout. Current status: ${toolStatus}` });
        }
        const now = new Date();
        let booking = await models_1.Booking.findOne({
            where: {
                toolId: id,
                userId: userId,
                status: 'booked',
                startDate: { [sequelize_1.Op.lte]: now },
                endDate: { [sequelize_1.Op.gte]: now }
            },
            transaction: t
        });
        if (booking) {
            await booking.update({ status: 'active' }, { transaction: t });
        }
        else {
            // No pre-existing booking found, create a new one for immediate checkout
            const toolWithAssocs = tool;
            const isUnavailable = ((_a = toolWithAssocs.bookings) === null || _a === void 0 ? void 0 : _a.some((b) => (b.status === 'approved' || b.status === 'active') &&
                new Date(b.startDate) < new Date(now.getTime() + 1) &&
                new Date(b.endDate) > now)) || ((_b = toolWithAssocs.maintenances) === null || _b === void 0 ? void 0 : _b.some((m) => (m.status === 'scheduled' || m.status === 'in_progress') &&
                new Date(m.startDate) < new Date(now.getTime() + 1) &&
                (m.endDate ? new Date(m.endDate) : new Date(m.startDate)) > now));
            if (isUnavailable) {
                await t.rollback();
                return res.status(409).json({ message: 'Tool is booked or in maintenance and cannot be checked out.' });
            }
            booking = await models_1.Booking.create({
                toolId: tool.id,
                userId: userId,
                startDate: now,
                endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // Default 1 week
                status: 'active',
            }, { transaction: t });
        }
        await tool.update({ currentOwnerId: userId }, { transaction: t });
        await t.commit();
        res.status(200).json(booking);
    }
    catch (error) {
        await t.rollback();
        console.error("Checkout error:", error);
        res.status(500).json({ message: 'Something went wrong during checkout.' });
    }
};
exports.checkoutTool = checkoutTool;
const checkinTool = async (req, res) => {
    const { id } = req.params;
    const t = await db_1.default.transaction();
    try {
        const tool = await models_1.Tool.findByPk(id, { transaction: t });
        if (!tool) {
            await t.rollback();
            return res.status(404).json({ message: 'Tool not found' });
        }
        const now = new Date();
        const booking = await models_1.Booking.findOne({
            where: {
                toolId: id,
                status: 'active',
                // Optional: check if the current user is the one who checked it out
                // userId: req.user.id
            },
            order: [['startDate', 'DESC']],
            transaction: t
        });
        if (!booking) {
            await t.rollback();
            return res.status(400).json({ message: 'No active booking found for this tool to check in.' });
        }
        await booking.update({ status: 'completed', endDate: now }, { transaction: t });
        await tool.update({ currentOwnerId: undefined }, { transaction: t });
        await t.commit();
        res.status(200).json({ message: 'Tool checked in successfully.' });
    }
    catch (error) {
        await t.rollback();
        console.error("Checkin error:", error);
        res.status(500).json({ message: 'Something went wrong during check-in.' });
    }
};
exports.checkinTool = checkinTool;
const getMyCheckedOutTools = async (req, res) => {
    try {
        const userId = req.user.id;
        const tools = await models_1.Tool.findAll({
            where: { currentOwnerId: userId },
            include: [{ model: models_1.ToolType, as: 'toolType' }]
        });
        res.status(200).json(tools);
    }
    catch (error) {
        console.error("Error in getMyCheckedOutTools:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getMyCheckedOutTools = getMyCheckedOutTools;
const getMyTools = async (req, res) => {
    try {
        const userId = req.user.id;
        const tools = await models_1.Tool.findAll({
            where: { currentOwnerId: userId },
            include: ['category', 'location', 'toolType', 'bookings', 'maintenances']
        });
        res.status(200).json(tools);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching user tools', error });
    }
};
exports.getMyTools = getMyTools;
