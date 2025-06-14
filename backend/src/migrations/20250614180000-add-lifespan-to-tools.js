'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tools', 'purchaseDate', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('tools', 'usageCount', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tools', 'purchaseDate');
    await queryInterface.removeColumn('tools', 'usageCount');
  }
}; 