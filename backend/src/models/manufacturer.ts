import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../db';

interface ManufacturerAttributes {
  id: number;
  name: string;
  logo?: string;
}

interface ManufacturerCreationAttributes extends Optional<ManufacturerAttributes, 'id'> {}

export class Manufacturer extends Model<ManufacturerAttributes, ManufacturerCreationAttributes> implements ManufacturerAttributes {
  public id!: number;
  public name!: string;
  public logo?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Manufacturer.hasMany(models.ToolType, {
      as: 'toolTypes',
      foreignKey: 'manufacturerId',
    });
  }
}

Manufacturer.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    logo: {
        type: DataTypes.STRING,
        allowNull: true,
    }
  },
  {
    sequelize,
    tableName: 'manufacturers',
    modelName: 'Manufacturer',
  }
); 