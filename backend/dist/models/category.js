"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class Category extends sequelize_1.Model {
    static associate(models) {
        Category.hasMany(models.ToolType, {
            as: 'toolTypes',
            foreignKey: 'categoryId',
        });
    }
}
exports.Category = Category;
Category.init({
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
}, {
    sequelize: db_1.default,
    tableName: 'categories',
    modelName: 'Category',
});
