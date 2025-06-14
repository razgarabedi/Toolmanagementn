import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../db';
import Role from './role';

interface UserAttributes {
  id: number;
  username: string;
  password_hash: string;
  email: string;
  role_id: number;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password_hash!: string;
  public email!: string;
  public role_id!: number;
  public role?: Role;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associate(models: any) {
    User.belongsTo(models.Role, { as: 'role', foreignKey: 'role_id' });
    User.hasMany(models.Booking, { as: 'bookings', foreignKey: 'userId' });
    User.hasMany(models.Notification, { as: 'notifications', foreignKey: 'userId' });
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    email: {
      type: new DataTypes.STRING(128),
      allowNull: false,
      unique: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: 'users',
    sequelize,
  }
);

export default User; 