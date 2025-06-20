"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sparePart_1 = require("../controllers/sparePart");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager'])], sparePart_1.getSpareParts);
router.post('/', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager'])], sparePart_1.createSparePart);
router.put('/:id', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager'])], sparePart_1.updateSparePart);
router.delete('/:id', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager'])], sparePart_1.deleteSparePart);
router.post('/assign', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager'])], sparePart_1.assignPartToMaintenance);
exports.default = router;
