import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../db';

interface NotificationAttributes {
  id: number;
  userId: number;
  messageKey: string;
  messagePayload: object;
  isRead: boolean;
  toolId?: number;
}

interface NotificationCreationAttributes extends Optional<NotificationAttributes, 'id' | 'isRead'> {}

export class Notification extends Model<NotificationAttributes, NotificationCreationAttributes> implements NotificationAttributes {
  public id!: number;
  public userId!: number;
  public messageKey!: string;
  public messagePayload!: object;
  public isRead!: boolean;
  public toolId?: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    Notification.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    Notification.belongsTo(models.Tool, { as: 'tool', foreignKey: 'toolId' });
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
    messageKey: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    messagePayload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    toolId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tools',
        key: 'id',
      },
    }
  },
  {
    sequelize,
    tableName: 'notifications',
    modelName: 'Notification',
  }
); 