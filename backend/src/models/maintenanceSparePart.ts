import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../db';

interface MaintenanceSparePartAttributes {
  id: number;
  maintenanceId: number;
  sparePartId: number;
  quantityUsed: number;
}

interface MaintenanceSparePartCreationAttributes extends Optional<MaintenanceSparePartAttributes, 'id'> {}

export class MaintenanceSparePart extends Model<MaintenanceSparePartAttributes, MaintenanceSparePartCreationAttributes> implements MaintenanceSparePartAttributes {
  public id!: number;
  public maintenanceId!: number;
  public sparePartId!: number;
  public quantityUsed!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MaintenanceSparePart.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    maintenanceId: {
      type: DataTypes.INTEGER,
      references: { model: 'maintenances', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    sparePartId: {
      type: DataTypes.INTEGER,
      references: { model: 'spare_parts', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    quantityUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'maintenance_spare_parts',
    modelName: 'MaintenanceSparePart',
  }
); 