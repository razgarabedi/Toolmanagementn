'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('tools');

    // Add name column if it doesn't exist
    if (!tableDescription.name) {
        await queryInterface.addColumn('tools', 'name', {
          type: Sequelize.STRING,
          allowNull: true,
        });
    }

    // Add new columns
    if (!tableDescription.instanceImage) {
        await queryInterface.addColumn('tools', 'instanceImage', {
          type: Sequelize.STRING,
          allowNull: true,
        });
    }
    if (!tableDescription.toolTypeId) {
        await queryInterface.addColumn('tools', 'toolTypeId', {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
                model: 'tool_types',
                key: 'id'
            }
        });
    }
    if (!tableDescription.rfid) {
        await queryInterface.addColumn('tools', 'rfid', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });
    }
    if (!tableDescription.serialNumber) {
        await queryInterface.addColumn('tools', 'serialNumber', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });
    }
    if (!tableDescription.description) {
        await queryInterface.addColumn('tools', 'description', {
            type: Sequelize.TEXT,
            allowNull: true,
        });
    }
    if (!tableDescription.purchaseDate) {
        await queryInterface.addColumn('tools', 'purchaseDate', {
          type: Sequelize.DATE,
          allowNull: true,
        });
    }
    if (!tableDescription.cost) {
        await queryInterface.addColumn('tools', 'cost', {
            type: Sequelize.FLOAT,
            allowNull: true
        });
    }
    if (!tableDescription.warrantyEndDate) {
        await queryInterface.addColumn('tools', 'warrantyEndDate', {
            type: Sequelize.DATE,
            allowNull: true,
        });
    }
    if (!tableDescription.usageCount) {
        await queryInterface.addColumn('tools', 'usageCount', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        });
    }
    if (!tableDescription.locationId) {
        await queryInterface.addColumn('tools', 'locationId', {
          type: Sequelize.INTEGER,
          allowNull: true,
        });
    }
    if (!tableDescription.currentOwnerId) {
        await queryInterface.addColumn('tools', 'currentOwnerId', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        });
    }
    if (!tableDescription.manufacturerId) {
        await queryInterface.addColumn('tools', 'manufacturerId', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'manufacturers',
            key: 'id'
          }
        });
    }
    // Update status enum
    await queryInterface.changeColumn('tools', 'status', {
        type: Sequelize.ENUM('available', 'in_use', 'in_maintenance', 'booked'),
        allowNull: false
    });
  },
  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('tools');

    if (tableDescription.name) await queryInterface.removeColumn('tools', 'name');
    if (tableDescription.description) await queryInterface.removeColumn('tools', 'description');
    if (tableDescription.instanceImage) await queryInterface.removeColumn('tools', 'instanceImage');
    if (tableDescription.toolTypeId) await queryInterface.removeColumn('tools', 'toolTypeId');
    if (tableDescription.rfid) await queryInterface.removeColumn('tools', 'rfid');
    if (tableDescription.serialNumber) await queryInterface.removeColumn('tools', 'serialNumber');
    if (tableDescription.purchaseDate) await queryInterface.removeColumn('tools', 'purchaseDate');
    if (tableDescription.cost) await queryInterface.removeColumn('tools', 'cost');
    if (tableDescription.warrantyEndDate) await queryInterface.removeColumn('tools', 'warrantyEndDate');
    if (tableDescription.usageCount) await queryInterface.removeColumn('tools', 'usageCount');
    if (tableDescription.locationId) await queryInterface.removeColumn('tools', 'locationId');
    if (tableDescription.currentOwnerId) await queryInterface.removeColumn('tools', 'currentOwnerId');
    if (tableDescription.manufacturerId) await queryInterface.removeColumn('tools', 'manufacturerId');

    await queryInterface.changeColumn('tools', 'status', {
        type: Sequelize.ENUM('available', 'in_use', 'in_maintenance'),
        allowNull: false
    });
  }
}; 