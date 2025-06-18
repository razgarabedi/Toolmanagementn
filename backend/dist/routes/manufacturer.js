"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const manufacturer_1 = require("../controllers/manufacturer");
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = (0, express_1.Router)();
router.post('/', [auth_1.auth, (0, auth_1.authorize)(['admin']), upload_1.default.single('logo')], manufacturer_1.createManufacturer);
router.get('/', auth_1.auth, manufacturer_1.getManufacturers);
router.delete('/:id', [auth_1.auth, (0, auth_1.authorize)(['admin'])], manufacturer_1.deleteManufacturer);
exports.default = router;
