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
exports.getToolTypes = exports.createToolType = void 0;
const models_1 = require("../models");
const createToolType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, categoryId } = req.body;
        const image = req.file ? req.file.path : undefined;
        const newToolType = yield models_1.ToolType.create({
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
});
exports.createToolType = createToolType;
const getToolTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const toolTypes = yield models_1.ToolType.findAll({ include: ['category'] });
        res.status(200).json(toolTypes);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching tool types', error });
    }
});
exports.getToolTypes = getToolTypes;
