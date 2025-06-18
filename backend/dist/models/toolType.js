"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolType = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../db"));
const tool_1 = __importDefault(require("./tool"));
class ToolType extends sequelize_1.Model {
    static associate(models) {
        ToolType.hasMany(models.Tool, {
            as: 'instances',
            foreignKey: 'toolTypeId',
        });
        ToolType.belongsTo(models.Category, {
            as: 'category',
            foreignKey: 'categoryId',
        });
        ToolType.belongsTo(models.Manufacturer, {
            as: 'manufacturer',
            foreignKey: 'manufacturerId',
        });
    }
}
exports.ToolType = ToolType;
ToolType.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    manufacturerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'manufacturers',
            key: 'id'
        }
    },
    image: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    }
}, {
    sequelize: db_1.default,
    tableName: 'tool_types',
    modelName: 'ToolType',
});
ToolType.addScope('withInstances', {
    include: [{
            model: tool_1.default,
            as: 'instances'
        }]
});
