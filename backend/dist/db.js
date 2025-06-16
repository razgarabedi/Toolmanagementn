"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize('werkzeugmeister', 'werkzeugmeister_user', 'a3eilm2s2y', {
    host: 'localhost',
    dialect: 'postgres',
});
exports.default = sequelize;
