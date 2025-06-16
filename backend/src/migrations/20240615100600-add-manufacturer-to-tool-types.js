'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tool_types', 'manufacturerId', {
      type: Sequelize.INTEGER,
      references: {
        model: 'manufacturers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tool_types', 'manufacturerId');
  },
}; 