"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class Notification extends sequelize_1.Model {
    static associate(models) {
        Notification.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
        Notification.belongsTo(models.Tool, { as: 'tool', foreignKey: 'toolId' });
    }
}
exports.Notification = Notification;
Notification.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    messageKey: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    messagePayload: {
        type: sequelize_1.DataTypes.JSON,
        allowNull: true,
    },
    isRead: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    toolId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'tools',
            key: 'id',
        },
    }
}, {
    sequelize: db_1.default,
    tableName: 'notifications',
    modelName: 'Notification',
});
