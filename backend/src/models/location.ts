import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../db';

interface LocationAttributes {
  id: number;
  name: string;
}

interface LocationCreationAttributes extends Optional<LocationAttributes, 'id'> {}

export class Location extends Model<LocationAttributes, LocationCreationAttributes> implements LocationAttributes {
  public id!: number;
  public name!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Location.hasMany(models.Tool, { as: 'tools', foreignKey: 'locationId' });
  }
}

Location.init(
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
  },
  {
    sequelize,
    tableName: 'locations',
    modelName: 'Location',
  }
); 