"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', [auth_1.auth, (0, auth_1.authorize)(['admin'])], user_1.getUsers);
router.put('/:id/role', [auth_1.auth, (0, auth_1.authorize)(['admin'])], user_1.updateUserRole);
exports.default = router;
