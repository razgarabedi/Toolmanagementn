'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('bookings', 'checkinNotes', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('bookings', 'conditionOnReturn', {
      type: Sequelize.ENUM('new', 'good', 'fair', 'poor'),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('bookings');
    if (tableDescription.checkinNotes) {
      await queryInterface.removeColumn('bookings', 'checkinNotes');
    }
    if (tableDescription.conditionOnReturn) {
      await queryInterface.removeColumn('bookings', 'conditionOnReturn');
    }
  }
}; 