"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class Tool extends sequelize_1.Model {
    static associate(models) {
        Tool.belongsTo(models.User, { as: 'currentOwner', foreignKey: 'currentOwnerId' });
        Tool.hasMany(models.Booking, { as: 'bookings', foreignKey: 'toolId' });
        Tool.belongsTo(models.Location, { as: 'location', foreignKey: 'locationId' });
        Tool.belongsTo(models.ToolType, { as: 'toolType', foreignKey: 'toolTypeId' });
        Tool.hasMany(models.Attachment, { as: 'attachments', foreignKey: 'toolId' });
        Tool.belongsTo(models.Manufacturer, { as: 'manufacturer', foreignKey: 'manufacturerId' });
    }
}
Tool.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    toolTypeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tool_types',
            key: 'id'
        }
    },
    rfid: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    serialNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('available', 'in_use', 'in_maintenance', 'booked'),
        allowNull: false,
    },
    condition: {
        type: sequelize_1.DataTypes.ENUM('new', 'good', 'fair', 'poor'),
        allowNull: false,
    },
    purchaseDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    cost: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: true
    },
    warrantyEndDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    usageCount: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    locationId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    currentOwnerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    instanceImage: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    manufacturerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'manufacturers',
            key: 'id'
        }
    },
}, {
    tableName: 'tools',
    sequelize: db_1.default,
});
exports.default = Tool;
