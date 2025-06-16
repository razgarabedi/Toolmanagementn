"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyCheckedOutTools = exports.checkinTool = exports.checkoutTool = exports.deleteTool = exports.updateTool = exports.getTool = exports.getTools = exports.createTool = exports.getToolTypes = void 0;
const models_1 = require("../models");
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const models_2 = require("../models");
const getToolTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const toolTypes = yield models_1.ToolType.findAll({
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
});
exports.getToolTypes = getToolTypes;
const createTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield db_1.default.transaction();
    try {
        const { toolTypeId, rfid, serialNumber, status, condition, purchaseDate, cost, warrantyEndDate, locationId, manufacturerId, description, name } = req.body;
        const files = req.files;
        const instanceImage = files.instanceImage ? files.instanceImage[0].path : undefined;
        const tool = yield models_1.Tool.create({
            toolTypeId,
            rfid,
            serialNumber,
            status,
            condition,
            purchaseDate: purchaseDate || null,
            cost,
            warrantyEndDate: warrantyEndDate || null,
            locationId,
            manufacturerId,
            description,
            name,
            instanceImage,
        }, { transaction: t });
        if (files.attachments) {
            const attachments = files.attachments.map(file => ({
                fileName: file.originalname,
                filePath: file.path,
                toolId: tool.id
            }));
            yield models_1.Attachment.bulkCreate(attachments, { transaction: t });
        }
        yield t.commit();
        const result = yield models_1.Tool.findByPk(tool.id, { include: ['attachments'] });
        res.status(201).json(result);
    }
    catch (error) {
        yield t.rollback();
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
            return res.status(400).json({
                message: "Invalid reference to another entity",
                error: {
                    field: error.fields[0],
                }
            });
        }
        console.error("Error creating tool:", error);
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating tool', error });
    }
});
exports.createTool = createTool;
const getTools = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        const whereClause = {};
        const tools = yield models_1.Tool.findAll({
            where: whereClause,
            include: [
                {
                    model: models_1.ToolType,
                    as: 'toolType',
                    where: search ? { name: { [sequelize_1.Op.like]: `%${search}%` } } : undefined
                },
                { model: models_1.User, as: 'currentOwner', attributes: ['id', 'username'] },
                { model: models_1.Booking, as: 'bookings' },
                { model: models_1.Location, as: 'location', attributes: ['id', 'name'] }
            ],
            order: [['createdAt', 'DESC']],
        });
        res.status(200).json(tools);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getTools = getTools;
const getTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const tool = yield models_1.Tool.findByPk(id, {
            include: [
                { model: models_1.ToolType, as: 'toolType' },
                { model: models_1.User, as: 'currentOwner', attributes: ['id', 'username'] },
                { model: models_1.Booking, as: 'bookings' },
                { model: models_1.Location, as: 'location', attributes: ['id', 'name'] }
            ]
        });
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        res.status(200).json(tool);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getTool = getTool;
const updateTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { toolTypeId, rfid, serialNumber, status, condition, purchaseDate, cost, warrantyEndDate, locationId, manufacturerId, description, name } = req.body;
        const tool = yield models_1.Tool.findByPk(id);
        if (tool) {
            yield tool.update({ toolTypeId, rfid, serialNumber, status, condition, purchaseDate: purchaseDate || null, cost, warrantyEndDate: warrantyEndDate || null, locationId, manufacturerId, description, name });
            res.status(200).json(tool);
        }
        else {
            res.status(404).json({ message: 'Tool not found' });
        }
    }
    catch (error) {
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
            return res.status(400).json({
                message: "Invalid reference to another entity",
                error: {
                    field: error.fields[0],
                }
            });
        }
        console.error("Error updating tool:", error);
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error updating tool' });
    }
});
exports.updateTool = updateTool;
const deleteTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const tool = yield models_1.Tool.findByPk(id);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        yield tool.destroy();
        res.status(204).json({ message: 'Tool deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.deleteTool = deleteTool;
const checkoutTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const tool = yield models_1.Tool.findByPk(id);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        if (tool.status === 'in_use') {
            return res.status(400).json({ message: 'Tool is already in use.' });
        }
        if (tool.status === 'in_maintenance') {
            return res.status(400).json({ message: 'Tool is in maintenance.' });
        }
        const now = new Date();
        const existingBooking = yield models_1.Booking.findOne({
            where: {
                toolId: tool.id,
                userId,
                status: 'booked',
                startDate: { [sequelize_1.Op.lte]: now },
                endDate: { [sequelize_1.Op.gte]: now }
            }
        });
        if (tool.status === 'booked' && !existingBooking) {
            return res.status(400).json({ message: 'Tool is booked by another user for this period.' });
        }
        if (existingBooking) {
            existingBooking.status = 'active';
            yield existingBooking.save();
        }
        else {
            // Create a new booking if one doesn't exist
            yield models_1.Booking.create({
                toolId: tool.id,
                userId,
                startDate: now,
                // Set a default end date, e.g., 2 weeks from now
                endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
                status: 'active'
            });
        }
        yield tool.update({ status: 'in_use', currentOwnerId: userId });
        res.status(200).json(tool);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.checkoutTool = checkoutTool;
const checkinTool = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const tool = yield models_1.Tool.findByPk(id);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        if (tool.status !== 'in_use') {
            return res.status(400).json({ message: 'Tool is not checked out.' });
        }
        if (tool.currentOwnerId !== userId) {
            return res.status(403).json({ message: 'You are not the current owner of this tool.' });
        }
        const now = new Date();
        const activeBooking = yield models_1.Booking.findOne({
            where: {
                toolId: tool.id,
                userId,
                status: 'active'
            }
        });
        if (activeBooking) {
            activeBooking.status = 'completed';
            activeBooking.endDate = now;
            yield activeBooking.save();
        }
        tool.status = 'available';
        tool.currentOwnerId = undefined;
        tool.usageCount = (tool.usageCount || 0) + 1;
        yield tool.save();
        const toolWithType = yield models_1.Tool.findByPk(tool.id, { include: [{ model: models_1.ToolType, as: 'toolType' }] });
        // Notify admin (user ID 1)
        yield models_2.Notification.create({
            userId: 1, // Assuming admin user has ID 1
            message: `Tool "${toolWithType.toolType.name}" has been checked in by user #${userId}.`
        });
        res.status(200).json(toolWithType);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.checkinTool = checkinTool;
const getMyCheckedOutTools = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const tools = yield models_1.Tool.findAll({
            where: { currentOwnerId: userId },
            include: [{ model: models_1.ToolType, as: 'toolType' }]
        });
        res.status(200).json(tools);
    }
    catch (error) {
        console.error("Error in getMyCheckedOutTools:", error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getMyCheckedOutTools = getMyCheckedOutTools;
