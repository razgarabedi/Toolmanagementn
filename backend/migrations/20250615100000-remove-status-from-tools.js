'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('tools', 'status');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('tools', 'status', {
      type: Sequelize.ENUM('available', 'in_use', 'in_maintenance', 'booked'),
      allowNull: false,
      defaultValue: 'available'
    });
  }
}; 