"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateToolType = exports.deleteToolType = exports.getToolTypes = exports.createToolType = void 0;
const models_1 = require("../models");
const utils_1 = require("../lib/utils");
const createToolType = async (req, res) => {
    try {
        const { name, description, categoryId } = req.body;
        const image = req.file ? req.file.path : undefined;
        const newToolType = await models_1.ToolType.create({
            name,
            description,
            categoryId,
            image,
        });
        res.status(201).json(newToolType);
    }
    catch (error) {
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.createToolType = createToolType;
const getToolTypes = async (req, res) => {
    try {
        const toolTypes = await models_1.ToolType.scope('withInstances').findAll({
            include: [{ model: models_1.Category, as: 'category' }]
        });
        res.status(200).json({ data: toolTypes });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tool types' });
    }
};
exports.getToolTypes = getToolTypes;
const deleteToolType = async (req, res) => {
    await (0, utils_1.deleteResource)(req, res, models_1.ToolType, 'Tool Type', { model: models_1.Tool, as: 'instances' });
};
exports.deleteToolType = deleteToolType;
const updateToolType = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, categoryId } = req.body;
        const image = req.file ? req.file.path : undefined;
        const toolType = await models_1.ToolType.findByPk(id);
        if (!toolType) {
            return res.status(404).json({ message: 'Tool type not found' });
        }
        toolType.name = name !== null && name !== void 0 ? name : toolType.name;
        toolType.description = description !== null && description !== void 0 ? description : toolType.description;
        toolType.categoryId = categoryId !== null && categoryId !== void 0 ? categoryId : toolType.categoryId;
        if (image) {
            toolType.image = image;
        }
        await toolType.save();
        const updatedToolType = await models_1.ToolType.scope('withInstances').findByPk(id, {
            include: [{ model: models_1.Category, as: 'category' }]
        });
        res.status(200).json(updatedToolType);
    }
    catch (error) {
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Something went wrong', error });
    }
};
exports.updateToolType = updateToolType;
