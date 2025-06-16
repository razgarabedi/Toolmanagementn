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
exports.getMissingToolsReport = exports.getUtilizationReport = exports.getMaintenanceCostReport = exports.getUtilizationSummary = exports.getMaintenanceSummary = exports.getInventorySummary = void 0;
const models_1 = require("../models");
const db_1 = __importDefault(require("../db"));
const sequelize_1 = require("sequelize");
const getInventorySummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summary = yield models_1.Tool.findAll({
            attributes: [
                'status',
                [db_1.default.fn('COUNT', db_1.default.col('id')), 'count']
            ],
            group: ['status']
        });
        const formattedSummary = summary.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count, 10);
            return acc;
        }, {});
        res.status(200).json(formattedSummary);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getInventorySummary = getInventorySummary;
const getMaintenanceSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summary = yield models_1.Maintenance.findAll({
            attributes: [
                'status',
                [db_1.default.fn('COUNT', db_1.default.col('id')), 'count']
            ],
            group: ['status']
        });
        const formattedSummary = summary.reduce((acc, item) => {
            acc[item.status] = parseInt(item.count, 10);
            return acc;
        }, {});
        res.status(200).json(formattedSummary);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getMaintenanceSummary = getMaintenanceSummary;
const getUtilizationSummary = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const summary = yield models_1.Booking.findAll({
            attributes: [
                'toolId',
                [db_1.default.fn('COUNT', db_1.default.col('toolId')), 'bookingCount']
            ],
            group: ['toolId', 'tool.id'],
            order: [[db_1.default.fn('COUNT', db_1.default.col('toolId')), 'DESC']],
            limit: 5,
            include: [{ model: models_1.Tool, as: 'tool', attributes: ['name'] }]
        });
        res.status(200).json(summary);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getUtilizationSummary = getUtilizationSummary;
const getMaintenanceCostReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield models_1.Maintenance.findAll({
            attributes: [
                'toolId',
                [db_1.default.fn('SUM', db_1.default.col('cost')), 'totalCost']
            ],
            group: ['toolId', 'tool.id'],
            include: [{ model: models_1.Tool, as: 'tool', attributes: ['name'] }],
            raw: true,
        });
        res.status(200).json(report);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getMaintenanceCostReport = getMaintenanceCostReport;
const getUtilizationReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tools = yield models_1.Tool.findAll({
            attributes: [
                'id',
                'usageCount',
            ],
            include: [{
                    model: models_1.ToolType,
                    as: 'toolType',
                    attributes: ['name']
                }],
        });
        const bookings = yield models_1.Booking.findAll({
            where: { status: ['completed', 'checked-in'] },
            attributes: ['toolId', 'startDate', 'endDate'],
        });
        const durationMap = bookings.reduce((acc, booking) => {
            if (booking.toolId && booking.startDate && booking.endDate) {
                const duration = new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime();
                acc[booking.toolId] = (acc[booking.toolId] || 0) + duration;
            }
            return acc;
        }, {});
        const report = tools.map(tool => ({
            id: tool.id,
            name: tool.toolType.name,
            usageCount: tool.usageCount,
            totalDuration: durationMap[tool.id] || 0
        }));
        res.status(200).json(report);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getUtilizationReport = getUtilizationReport;
const getMissingToolsReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const missingTools = yield models_1.Booking.findAll({
            where: {
                status: 'active',
                endDate: {
                    [sequelize_1.Op.lt]: new Date()
                }
            },
            include: ['tool', 'user']
        });
        res.status(200).json(missingTools);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getMissingToolsReport = getMissingToolsReport;
