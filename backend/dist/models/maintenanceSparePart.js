"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceSparePart = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class MaintenanceSparePart extends sequelize_1.Model {
}
exports.MaintenanceSparePart = MaintenanceSparePart;
MaintenanceSparePart.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    maintenanceId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: { model: 'maintenances', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    sparePartId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: { model: 'spare_parts', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    quantityUsed: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    sequelize: db_1.default,
    tableName: 'maintenance_spare_parts',
    modelName: 'MaintenanceSparePart',
});
