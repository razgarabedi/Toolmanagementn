"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMaintenance = exports.getToolMaintenanceHistory = exports.createMaintenance = void 0;
const models_1 = require("../models");
const createMaintenance = async (req, res) => {
    try {
        const { toolId, description, cost, startDate, endDate, status } = req.body;
        const tool = await models_1.Tool.findByPk(toolId);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        const maintenance = await models_1.Maintenance.create({
            toolId,
            description,
            cost,
            startDate,
            endDate,
            status,
        });
        res.status(201).json(maintenance);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.createMaintenance = createMaintenance;
const getToolMaintenanceHistory = async (req, res) => {
    try {
        const { toolId } = req.params;
        const history = await models_1.Maintenance.findAll({ where: { toolId }, order: [['startDate', 'DESC']] });
        res.status(200).json(history);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.getToolMaintenanceHistory = getToolMaintenanceHistory;
const updateMaintenance = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, cost, startDate, endDate, status } = req.body;
        const maintenance = await models_1.Maintenance.findByPk(id);
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        await maintenance.update({ description, cost, startDate, endDate, status });
        res.status(200).json(maintenance);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};
exports.updateMaintenance = updateMaintenance;
