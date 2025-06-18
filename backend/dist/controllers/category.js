"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.getCategories = exports.createCategory = void 0;
const models_1 = require("../models");
const utils_1 = require("../lib/utils");
const createCategory = async (req, res) => {
    const { name } = req.body;
    try {
        const category = await models_1.Category.create({ name });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating category', error });
    }
};
exports.createCategory = createCategory;
const getCategories = async (req, res) => {
    try {
        const categories = await models_1.Category.findAll();
        res.status(200).json({ data: categories });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching categories', error });
    }
};
exports.getCategories = getCategories;
const deleteCategory = async (req, res) => {
    await (0, utils_1.deleteResource)(req, res, models_1.Category, 'Category', { model: models_1.ToolType, as: 'toolTypes' });
};
exports.deleteCategory = deleteCategory;
