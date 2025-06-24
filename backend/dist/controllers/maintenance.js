"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeMaintenance = exports.updateMaintenance = exports.getAllMaintenance = exports.getToolMaintenanceHistory = exports.createMaintenance = void 0;
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
        res.status(500).json({ message: 'Something went wrong', error: error.message });
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
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};
exports.getToolMaintenanceHistory = getToolMaintenanceHistory;
const getAllMaintenance = async (req, res) => {
    try {
        const maintenanceTasks = await models_1.Maintenance.findAll({
            include: [{ model: models_1.Tool, as: 'tool', attributes: ['name', 'id'] }],
            order: [['startDate', 'DESC']]
        });
        res.status(200).json(maintenanceTasks);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', 'error': error.message });
    }
};
exports.getAllMaintenance = getAllMaintenance;
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
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};
exports.updateMaintenance = updateMaintenance;
const closeMaintenance = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { notes } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const maintenance = await models_1.Maintenance.findByPk(id);
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        maintenance.status = 'completed';
        maintenance.endDate = new Date();
        maintenance.notes = notes;
        maintenance.completedByUserId = userId;
        await maintenance.save();
        // Also update the tool's status to 'available' if it's not in use
        const tool = await models_1.Tool.findByPk(maintenance.toolId);
        if (tool && tool.status === 'in_maintenance') {
            tool.status = 'available';
            await tool.save();
        }
        res.status(200).json(maintenance);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};
exports.closeMaintenance = closeMaintenance;
