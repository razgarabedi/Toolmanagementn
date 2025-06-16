'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('tool_types');
    if (tableDescription.manufacturerId) {
        await queryInterface.removeColumn('tool_types', 'manufacturerId');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('tool_types');
    if (!tableDescription.manufacturerId) {
        await queryInterface.addColumn('tool_types', 'manufacturerId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'manufacturers',
                key: 'id'
            }
        });
    }
  }
}; 