import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../db';

interface SparePartAttributes {
  id: number;
  name: string;
  quantity: number;
}

interface SparePartCreationAttributes extends Optional<SparePartAttributes, 'id'> {}

export class SparePart extends Model<SparePartAttributes, SparePartCreationAttributes> implements SparePartAttributes {
  public id!: number;
  public name!: string;
  public quantity!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SparePart.init(
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
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    }
  },
  {
    sequelize,
    tableName: 'spare_parts',
    modelName: 'SparePart',
  }
); 