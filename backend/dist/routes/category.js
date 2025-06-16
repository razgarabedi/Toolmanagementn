"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_1 = require("../controllers/category");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', [auth_1.auth, (0, auth_1.authorize)(['admin'])], category_1.createCategory);
router.get('/', auth_1.auth, category_1.getCategories);
exports.default = router;
