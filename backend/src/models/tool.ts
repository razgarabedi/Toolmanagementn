import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import User from './user';
import { ToolType } from './toolType';

interface ToolAttributes {
  id: number;
  name?: string;
  toolTypeId: number;
  rfid?: string;
  serialNumber?: string;
  status: 'available' | 'in_use' | 'in_maintenance' | 'booked';
  condition: 'new' | 'good' | 'fair' | 'poor';
  currentOwnerId?: number;
  purchaseDate?: Date | null;
  cost?: number | null;
  warrantyEndDate?: Date;
  usageCount: number;
  locationId?: number | null;
  manufacturerId?: number | null;
  instanceImage?: string;
  description?: string;
}

interface ToolCreationAttributes extends Optional<ToolAttributes, 'id' | 'usageCount'> {}

class Tool extends Model<ToolAttributes, ToolCreationAttributes> implements ToolAttributes {
  public id!: number;
  public name?: string;
  public toolTypeId!: number;
  public rfid?: string;
  public serialNumber?: string;
  public status!: 'available' | 'in_use' | 'in_maintenance' | 'booked';
  public condition!: 'new' | 'good' | 'fair' | 'poor';
  public currentOwnerId?: number;
  public purchaseDate!: Date | null;
  public cost?: number | null;
  public warrantyEndDate?: Date;
  public usageCount!: number;
  public locationId!: number | null;
  public manufacturerId?: number | null;
  public instanceImage?: string;
  public description?: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Tool.belongsTo(models.User, { as: 'currentOwner', foreignKey: 'currentOwnerId' });
    Tool.hasMany(models.Booking, { as: 'bookings', foreignKey: 'toolId' });
    Tool.belongsTo(models.Location, { as: 'location', foreignKey: 'locationId' });
    Tool.belongsTo(models.ToolType, { as: 'toolType', foreignKey: 'toolTypeId' });
    Tool.hasMany(models.Attachment, { as: 'attachments', foreignKey: 'toolId' });
    Tool.belongsTo(models.Manufacturer, { as: 'manufacturer', foreignKey: 'manufacturerId' });
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    toolTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tool_types',
            key: 'id'
        }
    },
    rfid: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    serialNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
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
    cost: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    warrantyEndDate: {
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
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    instanceImage: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    manufacturerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'manufacturers',
        key: 'id'
      }
    },
  },
  {
    tableName: 'tools',
    sequelize,
  }
);

export default Tool; 