'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Clean up existing data
    await queryInterface.bulkDelete('maintenances', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('users', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('spare_parts', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('attachments', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('tools', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('tool_types', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('manufacturers', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('categories', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('locations', null, { truncate: true, cascade: true, restartIdentity: true });

    // Locations
    await queryInterface.bulkInsert('locations', [
      { name: 'Warehouse A', createdAt: new Date(), updatedAt: new Date() },
      { name: 'Workshop 1', createdAt: new Date(), updatedAt: new Date() },
    ], {});
    const locations = await queryInterface.sequelize.query(`SELECT id from "locations";`);
    const locationRows = locations[0];

    // Categories
    await queryInterface.bulkInsert('categories', [
        { name: 'Elektrowerkzeuge', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Arbeitssicherheit', createdAt: new Date(), updatedAt: new Date() }
    ], {});
    const categories = await queryInterface.sequelize.query(`SELECT id from "categories";`);
    const categoryRows = categories[0];

    // Manufacturers
    await queryInterface.bulkInsert('manufacturers', [
        { name: 'Bosch', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Uvex', createdAt: new Date(), updatedAt: new Date() }
    ], {});
    const manufacturers = await queryInterface.sequelize.query(`SELECT id from "manufacturers";`);
    const manufacturerRows = manufacturers[0];

    // Tool Types
    await queryInterface.bulkInsert('tool_types', [
        { name: 'Schlagbohrmaschine Bosch GSB 19-2 RE', categoryId: categoryRows[0].id, manufacturerId: manufacturerRows[0].id, description: 'Leistungsstarke Schlagbohrmaschine für anspruchsvolle Bohr- und Schraubarbeiten in Mauerwerk, Holz und Metall. Mit Koffer.', image: '/images/tools/bosch-gsb-19-2.jpg', createdAt: new Date(), updatedAt: new Date() },
        { name: 'Schutzbrille Uvex i-3', categoryId: categoryRows[1].id, manufacturerId: manufacturerRows[1].id, description: 'Schutzbrille mit hervorragendem Sichtfeld und optimaler Passform.', image: '/images/tools/uvex-i3.jpg', createdAt: new Date(), updatedAt: new Date() }
    ], {});
    const toolTypes = await queryInterface.sequelize.query(`SELECT id from "tool_types";`);
    const toolTypeRows = toolTypes[0];

    // Tools
    await queryInterface.bulkInsert('tools', [
      { toolTypeId: toolTypeRows[0].id, rfid: 'RFID-SCHLAGBOHRER-001', serialNumber: 'GSB192RE-SN001A', status: 'available', condition: 'good', purchaseDate: new Date(), locationId: locationRows[0].id, cost: 250.00, createdAt: new Date(), updatedAt: new Date() },
      { toolTypeId: toolTypeRows[0].id, rfid: 'RFID-SCHLAGBOHRER-002', serialNumber: 'GSB192RE-SN001B', status: 'in_use', condition: 'good', purchaseDate: new Date(), locationId: locationRows[0].id, cost: 250.00, createdAt: new Date(), updatedAt: new Date() },
      { toolTypeId: toolTypeRows[0].id, rfid: 'RFID-SCHLAGBOHRER-003', serialNumber: 'GSB192RE-SN001C', status: 'available', condition: 'fair', purchaseDate: new Date(), locationId: locationRows[0].id, cost: 250.00, createdAt: new Date(), updatedAt: new Date() },
      { toolTypeId: toolTypeRows[1].id, rfid: 'RFID-SCHUTZBRILLE-001', serialNumber: 'UVEX-I3-SN001', status: 'available', condition: 'new', purchaseDate: new Date(), locationId: locationRows[1].id, cost: 15.00, createdAt: new Date(), updatedAt: new Date() },
      { toolTypeId: toolTypeRows[1].id, rfid: 'RFID-SCHUTZBRILLE-002', serialNumber: 'UVEX-I3-SN002', status: 'in_use', condition: 'new', purchaseDate: new Date(), locationId: locationRows[1].id, cost: 15.00, createdAt: new Date(), updatedAt: new Date() },
    ], {});

    // Spare Parts
    await queryInterface.bulkInsert('spare_parts', [
      { name: 'Drill Bit Set', quantity: 10, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Hammer Handle', quantity: 5, createdAt: new Date(), updatedAt: new Date() },
    ], {});

    // Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const roles = await queryInterface.sequelize.query(`SELECT id from "roles" WHERE name = 'user';`);
    const userRole = roles[0][0];
    await queryInterface.bulkInsert('users', [
        { username: 'testuser', email: 'test@example.com', password_hash: hashedPassword, role_id: userRole.id, createdAt: new Date(), updatedAt: new Date() }
    ], {});

    // Maintenances
    const tools = await queryInterface.sequelize.query(`SELECT id from "tools";`);
    const toolRows = tools[0];

    await queryInterface.bulkInsert('maintenances', [
      { toolId: toolRows[0].id, description: 'Routine checkup, handle is solid.', cost: 0, startDate: new Date(), status: 'completed', createdAt: new Date(), updatedAt: new Date() },
      { toolId: toolRows[1].id, description: 'Battery check, charge level is good.', cost: 5.00, startDate: new Date(), status: 'completed', createdAt: new Date(), updatedAt: new Date() },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('maintenances', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('users', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('spare_parts', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('attachments', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('tools', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('tool_types', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('manufacturers', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('categories', null, { truncate: true, cascade: true, restartIdentity: true });
    await queryInterface.bulkDelete('locations', null, { truncate: true, cascade: true, restartIdentity: true });
  }
}; 