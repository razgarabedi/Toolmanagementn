'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // First, change the column to a string to remove enum constraints
      await queryInterface.sequelize.query('ALTER TABLE "bookings" ALTER COLUMN "status" TYPE VARCHAR(255);', { transaction });
      
      // Now, update the old 'booked' status to the new 'approved' status
      await queryInterface.sequelize.query(`UPDATE "bookings" SET "status" = 'approved' WHERE "status" = 'booked';`, { transaction });

      // Drop the old ENUM type
      await queryInterface.sequelize.query('DROP TYPE "enum_bookings_status";', { transaction });
      
      // Create the new ENUM type with all the values
      await queryInterface.sequelize.query(`
        CREATE TYPE "enum_bookings_status" AS ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled');
      `, { transaction });
      
      // Finally, change the column back to the new ENUM type and set the default
      await queryInterface.sequelize.query(`
        ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "enum_bookings_status" USING "status"::"enum_bookings_status";
      `, { transaction });

      await queryInterface.changeColumn('bookings', 'status', {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'active', 'completed', 'cancelled'),
        defaultValue: 'pending',
        allowNull: false
      }, { transaction });
      
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
        // Remove the default value first to break the dependency
        await queryInterface.sequelize.query('ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;', { transaction });

        await queryInterface.sequelize.query('ALTER TABLE "bookings" ALTER COLUMN "status" TYPE VARCHAR(255);', { transaction });
        await queryInterface.sequelize.query(`UPDATE "bookings" SET "status" = 'booked' WHERE "status" = 'approved' OR "status" = 'pending' OR "status" = 'rejected';`, { transaction });
        await queryInterface.sequelize.query('DROP TYPE "enum_bookings_status";', { transaction });
        await queryInterface.sequelize.query(`CREATE TYPE "enum_bookings_status" AS ENUM('booked', 'active', 'completed', 'cancelled');`, { transaction });
        await queryInterface.sequelize.query(`ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "enum_bookings_status" USING "status"::"enum_bookings_status";`, { transaction });
        await transaction.commit();
    } catch (err) {
        await transaction.rollback();
        throw err;
    }
  }
};
