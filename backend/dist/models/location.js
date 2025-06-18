"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Location = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
class Location extends sequelize_1.Model {
    static associate(models) {
        Location.hasMany(models.Tool, {
            as: 'tools',
            foreignKey: 'locationId',
        });
    }
}
exports.Location = Location;
Location.init({
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
    tableName: 'locations',
    modelName: 'Location',
});
