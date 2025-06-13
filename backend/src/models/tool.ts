import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';

interface ToolAttributes {
  id: number;
  name: string;
  description: string;
  status: 'available' | 'in_use' | 'in_maintenance';
  condition: 'new' | 'good' | 'fair' | 'poor';
}

interface ToolCreationAttributes extends Optional<ToolAttributes, 'id'> {}

class Tool extends Model<ToolAttributes, ToolCreationAttributes> implements ToolAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public status!: 'available' | 'in_use' | 'in_maintenance';
  public condition!: 'new' | 'good' | 'fair' | 'poor';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Tool.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    description: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'in_use', 'in_maintenance'),
      allowNull: false,
    },
    condition: {
      type: DataTypes.ENUM('new', 'good', 'fair', 'poor'),
      allowNull: false,
    },
  },
  {
    tableName: 'tools',
    sequelize,
  }
);

export default Tool; 