"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const location_1 = require("../controllers/location");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', auth_1.auth, location_1.getLocations);
router.post('/', [auth_1.auth, (0, auth_1.authorize)(['admin', 'manager'])], location_1.createLocation);
exports.default = router;
