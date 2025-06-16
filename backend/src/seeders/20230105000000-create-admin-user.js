'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminEmail = 'admin@example.com';
    const adminUsername = 'admin';

    const existingUser = await queryInterface.sequelize.query(
      `SELECT id FROM "users" WHERE email = :email OR username = :username`,
      {
        replacements: { email: adminEmail, username: adminUsername },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (existingUser.length === 0) {
      const hashedPassword = await bcrypt.hash('adminpassword', 10);
      const roles = await queryInterface.sequelize.query(
        `SELECT id FROM "roles" WHERE name = 'admin'`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      const adminRole = roles[0];

      if (adminRole) {
        await queryInterface.bulkInsert('users', [
          {
            username: adminUsername,
            email: adminEmail,
            password_hash: hashedPassword,
            role_id: adminRole.id,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' }, {});
  },
}; 