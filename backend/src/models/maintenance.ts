import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import Tool from './tool';
import { SparePart } from './sparePart';

interface MaintenanceAttributes {
  id: number;
  toolId: number;
  description: string;
  cost?: number;
  startDate: Date;
  endDate?: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'requested';
}

interface MaintenanceCreationAttributes extends Optional<MaintenanceAttributes, 'id'> {}

class Maintenance extends Model<MaintenanceAttributes, MaintenanceCreationAttributes> implements MaintenanceAttributes {
  public id!: number;
  public toolId!: number;
  public tool?: Tool;
  public description!: string;
  public cost?: number;
  public startDate!: Date;
  public endDate?: Date;
  public status!: 'scheduled' | 'in_progress' | 'completed' | 'requested';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Maintenance.belongsTo(models.Tool, { as: 'tool', foreignKey: 'toolId' });
    Maintenance.belongsToMany(models.SparePart, { through: 'maintenance_spare_parts', as: 'spareParts', foreignKey: 'maintenanceId' });
  }
}

Maintenance.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    toolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tools',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'requested'),
      allowNull: false,
    },
  },
  {
    tableName: 'maintenances',
    sequelize,
  }
);

export default Maintenance; 