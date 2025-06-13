import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'werkzeugmeister',
  'werkzeugmeister_user',
  'a3eilm2s2y',
  {
    host: 'localhost',
    dialect: 'postgres',
  }
);

export default sequelize; 