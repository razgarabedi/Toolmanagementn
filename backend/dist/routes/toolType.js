"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const toolType_1 = require("../controllers/toolType");
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = (0, express_1.Router)();
router.post('/', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager']), upload_1.default.single('image')], toolType_1.createToolType);
router.get('/', auth_1.auth, toolType_1.getToolTypes);
router.put('/:id', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager']), upload_1.default.single('image')], toolType_1.updateToolType);
router.delete('/:id', [auth_1.auth, (0, auth_1.authorize)(['admin'])], toolType_1.deleteToolType);
exports.default = router;
