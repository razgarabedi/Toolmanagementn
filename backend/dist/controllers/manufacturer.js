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
exports.getManufacturers = exports.createManufacturer = void 0;
const models_1 = require("../models");
const createManufacturer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    const logo = req.file ? req.file.path : undefined;
    try {
        const manufacturer = yield models_1.Manufacturer.create({ name, logo });
        res.status(201).json(manufacturer);
    }
    catch (error) {
        if (error.message.includes('File upload only supports')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Error creating manufacturer', error });
    }
});
exports.createManufacturer = createManufacturer;
const getManufacturers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const manufacturers = yield models_1.Manufacturer.findAll();
        res.status(200).json(manufacturers);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching manufacturers', error });
    }
});
exports.getManufacturers = getManufacturers;
