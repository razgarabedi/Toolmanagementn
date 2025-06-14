'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('tools', 'type', {
      type: Sequelize.STRING,
      allowNull: true, // Or false if it's a required field
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tools', 'type');
  }
};
