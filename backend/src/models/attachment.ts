import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../db';

interface AttachmentAttributes {
  id: number;
  fileName: string;
  filePath: string;
  toolId: number;
}

interface AttachmentCreationAttributes extends Optional<AttachmentAttributes, 'id'> {}

export class Attachment extends Model<AttachmentAttributes, AttachmentCreationAttributes> implements AttachmentAttributes {
  public id!: number;
  public fileName!: string;
  public filePath!: string;
  public toolId!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attachment.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    toolId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'tools',
            key: 'id'
        }
    }
  },
  {
    sequelize,
    tableName: 'attachments',
    modelName: 'Attachment',
  }
); 