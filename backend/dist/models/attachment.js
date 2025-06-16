"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Attachment = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class Attachment extends sequelize_1.Model {
}
exports.Attachment = Attachment;
Attachment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    fileName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    filePath: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    toolId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tools',
            key: 'id'
        }
    }
}, {
    sequelize: db_1.default,
    tableName: 'attachments',
    modelName: 'Attachment',
});
