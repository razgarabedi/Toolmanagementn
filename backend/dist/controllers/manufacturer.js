"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteManufacturer = exports.getManufacturers = exports.createManufacturer = void 0;
const models_1 = require("../models");
const utils_1 = require("../lib/utils");
const createManufacturer = async (req, res) => {
    const { name } = req.body;
    const logo = req.file ? req.file.path : undefined;
    try {
        const manufacturer = await models_1.Manufacturer.create({ name, logo });
        res.status(201).json(manufacturer);
    }
    catch (error) {
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating manufacturer', error });
    }
};
exports.createManufacturer = createManufacturer;
const getManufacturers = async (req, res) => {
    try {
        const manufacturers = await models_1.Manufacturer.findAll();
        res.status(200).json({ data: manufacturers });
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching manufacturers', error });
    }
};
exports.getManufacturers = getManufacturers;
const deleteManufacturer = async (req, res) => {
    await (0, utils_1.deleteResource)(req, res, models_1.Manufacturer, 'Manufacturer', { model: models_1.ToolType, as: 'toolTypes' });
};
exports.deleteManufacturer = deleteManufacturer;
