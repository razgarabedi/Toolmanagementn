import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../db';
import Tool from './tool';
import { Manufacturer } from './manufacturer';
import { Category } from './category';

interface ToolTypeAttributes {
  id: number;
  name: string;
  description?: string;
  categoryId?: number;
  manufacturerId?: number;
  image?: string;
}

interface ToolTypeCreationAttributes extends Optional<ToolTypeAttributes, 'id'> {}

export class ToolType extends Model<ToolTypeAttributes, ToolTypeCreationAttributes> implements ToolTypeAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public categoryId?: number;
  public manufacturerId?: number;
  public image?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
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

ToolType.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'categories',
            key: 'id'
        }
    },
    manufacturerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'manufacturers',
            key: 'id'
        }
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,
    }
  },
  {
    sequelize,
    tableName: 'tool_types',
    modelName: 'ToolType',
  }
);

ToolType.addScope('withInstances', {
  include: [{
    model: Tool,
    as: 'instances'
  }]
}); 