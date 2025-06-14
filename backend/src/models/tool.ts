import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import User from './user';

interface ToolAttributes {
  id: number;
  name: string;
  description: string;
  type?: string;
  status: 'available' | 'in_use' | 'in_maintenance' | 'booked';
  condition: 'new' | 'good' | 'fair' | 'poor';
  currentOwnerId?: number;
  purchaseDate?: Date | null;
  usageCount: number;
  locationId?: number | null;
}

interface ToolCreationAttributes extends Optional<ToolAttributes, 'id' | 'usageCount'> {}

class Tool extends Model<ToolAttributes, ToolCreationAttributes> implements ToolAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public type?: string;
  public status!: 'available' | 'in_use' | 'in_maintenance' | 'booked';
  public condition!: 'new' | 'good' | 'fair' | 'poor';
  public currentOwnerId?: number;
  public purchaseDate!: Date | null;
  public usageCount!: number;
  public locationId!: number | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Tool.belongsTo(models.User, { as: 'currentOwner', foreignKey: 'currentOwnerId' });
    Tool.hasMany(models.Booking, { as: 'bookings', foreignKey: 'toolId' });
    Tool.belongsTo(models.Location, { as: 'location', foreignKey: 'locationId' });
  }
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
    type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('available', 'in_use', 'in_maintenance', 'booked'),
      allowNull: false,
    },
    condition: {
      type: DataTypes.ENUM('new', 'good', 'fair', 'poor'),
      allowNull: false,
    },
    purchaseDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    locationId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    currentOwnerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  },
  {
    tableName: 'tools',
    sequelize,
  }
);

export default Tool; 