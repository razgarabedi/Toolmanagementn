"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPartToMaintenance = exports.deleteSparePart = exports.updateSparePart = exports.createSparePart = exports.getSpareParts = void 0;
const models_1 = require("../models");
const db_1 = __importDefault(require("../db"));
const getSpareParts = async (req, res) => {
    try {
        const spareParts = await models_1.SparePart.findAll();
        res.status(200).json(spareParts);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getSpareParts = getSpareParts;
const createSparePart = async (req, res) => {
    try {
        const { name, quantity } = req.body;
        const sparePart = await models_1.SparePart.create({ name, quantity });
        res.status(201).json(sparePart);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.createSparePart = createSparePart;
const updateSparePart = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity } = req.body;
        const sparePart = await models_1.SparePart.findByPk(id);
        if (sparePart) {
            await sparePart.update({ name, quantity });
            res.status(200).json(sparePart);
        }
        else {
            res.status(404).json({ message: 'Spare part not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.updateSparePart = updateSparePart;
const deleteSparePart = async (req, res) => {
    try {
        const { id } = req.params;
        const sparePart = await models_1.SparePart.findByPk(id);
        if (sparePart) {
            await sparePart.destroy();
            res.status(204).send();
        }
        else {
            res.status(404).json({ message: 'Spare part not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.deleteSparePart = deleteSparePart;
const assignPartToMaintenance = async (req, res) => {
    const t = await db_1.default.transaction();
    try {
        const { maintenanceId, sparePartId, quantityUsed } = req.body;
        const sparePart = await models_1.SparePart.findByPk(sparePartId, { transaction: t });
        if (!sparePart || sparePart.quantity < quantityUsed) {
            await t.rollback();
            return res.status(400).json({ message: 'Insufficient spare part quantity.' });
        }
        await models_1.MaintenanceSparePart.create({ maintenanceId, sparePartId, quantityUsed }, { transaction: t });
        sparePart.quantity -= quantityUsed;
        await sparePart.save({ transaction: t });
        await t.commit();
        res.status(201).json({ message: 'Spare part assigned successfully' });
    }
    catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.assignPartToMaintenance = assignPartToMaintenance;
