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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMaintenance = exports.getToolMaintenanceHistory = exports.createMaintenance = void 0;
const models_1 = require("../models");
const createMaintenance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { toolId, description, cost, startDate, endDate, status } = req.body;
        const tool = yield models_1.Tool.findByPk(toolId);
        if (!tool) {
            return res.status(404).json({ message: 'Tool not found' });
        }
        const maintenance = yield models_1.Maintenance.create({
            toolId,
            description,
            cost,
            startDate,
            endDate,
            status,
        });
        if (status === 'scheduled' || status === 'in_progress' || status === 'requested') {
            yield tool.update({ status: 'in_maintenance' });
        }
        res.status(201).json(maintenance);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.createMaintenance = createMaintenance;
const getToolMaintenanceHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { toolId } = req.params;
        const history = yield models_1.Maintenance.findAll({ where: { toolId }, order: [['startDate', 'DESC']] });
        res.status(200).json(history);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getToolMaintenanceHistory = getToolMaintenanceHistory;
const updateMaintenance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { description, cost, startDate, endDate, status } = req.body;
        const maintenance = yield models_1.Maintenance.findByPk(id);
        if (!maintenance) {
            return res.status(404).json({ message: 'Maintenance record not found' });
        }
        yield maintenance.update({ description, cost, startDate, endDate, status });
        if (status === 'completed') {
            const tool = yield models_1.Tool.findByPk(maintenance.toolId);
            if (tool) {
                // Only set to available if no other maintenance is active
                const otherMaintenance = yield models_1.Maintenance.findOne({
                    where: {
                        toolId: tool.id,
                        status: ['scheduled', 'in_progress', 'requested']
                    }
                });
                if (!otherMaintenance) {
                    yield tool.update({ status: 'available' });
                }
            }
        }
        else {
            const tool = yield models_1.Tool.findByPk(maintenance.toolId);
            if (tool && tool.status !== 'in_maintenance') {
                yield tool.update({ status: 'in_maintenance' });
            }
        }
        res.status(200).json(maintenance);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.updateMaintenance = updateMaintenance;
