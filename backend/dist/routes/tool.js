"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tool_1 = require("../controllers/tool");
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, tool_1.getTools);
router.get('/my-tools', auth_1.auth, tool_1.getMyCheckedOutTools);
router.get('/:id', auth_1.auth, tool_1.getTool);
router.post('/', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager']), upload_1.default.fields([{ name: 'instanceImage', maxCount: 1 }, { name: 'attachments' }])], tool_1.createTool);
router.put('/:id', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager'])], tool_1.updateTool);
router.delete('/:id', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager'])], tool_1.deleteTool);
router.post('/:id/checkout', auth_1.auth, tool_1.checkoutTool);
router.post('/:id/checkin', auth_1.auth, tool_1.checkinTool);
exports.default = router;
