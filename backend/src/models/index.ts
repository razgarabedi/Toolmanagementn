import User from './user';
import Role from './role';
import Tool from './tool';

Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });

export { User, Role, Tool }; 