"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Manufacturer = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class Manufacturer extends sequelize_1.Model {
    static associate(models) {
        Manufacturer.hasMany(models.ToolType, {
            as: 'toolTypes',
            foreignKey: 'manufacturerId',
        });
    }
}
exports.Manufacturer = Manufacturer;
Manufacturer.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    logo: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize: db_1.default,
    tableName: 'manufacturers',
    modelName: 'Manufacturer',
});
