"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class Maintenance extends sequelize_1.Model {
    static associate(models) {
        Maintenance.belongsTo(models.Tool, { as: 'tool', foreignKey: 'toolId' });
        Maintenance.belongsToMany(models.SparePart, { through: 'maintenance_spare_parts', as: 'spareParts', foreignKey: 'maintenanceId' });
    }
}
Maintenance.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    toolId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tools',
            key: 'id',
        },
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    cost: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true,
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'requested'),
        allowNull: false,
    },
}, {
    tableName: 'maintenances',
    sequelize: db_1.default,
});
exports.default = Maintenance;
