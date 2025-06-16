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
exports.assignPartToMaintenance = exports.deleteSparePart = exports.updateSparePart = exports.createSparePart = exports.getSpareParts = void 0;
const models_1 = require("../models");
const db_1 = __importDefault(require("../db"));
const getSpareParts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const spareParts = yield models_1.SparePart.findAll();
        res.status(200).json(spareParts);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.getSpareParts = getSpareParts;
const createSparePart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, quantity } = req.body;
        const sparePart = yield models_1.SparePart.create({ name, quantity });
        res.status(201).json(sparePart);
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.createSparePart = createSparePart;
const updateSparePart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, quantity } = req.body;
        const sparePart = yield models_1.SparePart.findByPk(id);
        if (sparePart) {
            yield sparePart.update({ name, quantity });
            res.status(200).json(sparePart);
        }
        else {
            res.status(404).json({ message: 'Spare part not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.updateSparePart = updateSparePart;
const deleteSparePart = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const sparePart = yield models_1.SparePart.findByPk(id);
        if (sparePart) {
            yield sparePart.destroy();
            res.status(204).send();
        }
        else {
            res.status(404).json({ message: 'Spare part not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.deleteSparePart = deleteSparePart;
const assignPartToMaintenance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const t = yield db_1.default.transaction();
    try {
        const { maintenanceId, sparePartId, quantityUsed } = req.body;
        const sparePart = yield models_1.SparePart.findByPk(sparePartId, { transaction: t });
        if (!sparePart || sparePart.quantity < quantityUsed) {
            yield t.rollback();
            return res.status(400).json({ message: 'Insufficient spare part quantity.' });
        }
        yield models_1.MaintenanceSparePart.create({ maintenanceId, sparePartId, quantityUsed }, { transaction: t });
        sparePart.quantity -= quantityUsed;
        yield sparePart.save({ transaction: t });
        yield t.commit();
        res.status(201).json({ message: 'Spare part assigned successfully' });
    }
    catch (error) {
        yield t.rollback();
        res.status(500).json({ message: 'Something went wrong' });
    }
});
exports.assignPartToMaintenance = assignPartToMaintenance;
