import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import Tool from './tool';
import User from './user';

interface BookingAttributes {
  id: number;
  toolId: number;
  userId: number;
  startDate: Date;
  endDate: Date;
  status: 'booked' | 'active' | 'completed' | 'cancelled';
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: number;
  public toolId!: number;
  public userId!: number;
  public startDate!: Date;
  public endDate!: Date;
  public status!: 'booked' | 'active' | 'completed' | 'cancelled';

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Booking.belongsTo(models.Tool, { foreignKey: 'toolId', as: 'tool' });
    Booking.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

Booking.init(
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('booked', 'active', 'completed', 'cancelled'),
      allowNull: false,
    },
  },
  {
    tableName: 'bookings',
    sequelize,
  }
);

export default Booking; 