import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../db';

interface NotificationAttributes {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'isRead'> {}

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public userId!: number;
  public message!: string;
  public isRead!: boolean;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Notification.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
  }
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    message: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    }
  },
  {
    sequelize,
    tableName: 'notifications',
    modelName: 'Notification',
  }
); 