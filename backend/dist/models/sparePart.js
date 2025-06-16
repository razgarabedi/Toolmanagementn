"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparePart = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class SparePart extends sequelize_1.Model {
}
exports.SparePart = SparePart;
SparePart.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
}, {
    sequelize: db_1.default,
    tableName: 'spare_parts',
    modelName: 'SparePart',
});
