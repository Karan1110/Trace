"use strict"

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if the column exists before trying to modify it
    const tableInfo = await queryInterface.describeTable("Users")

    if ("chats" in tableInfo) {
      // Modify the existing column to add the default value
      await queryInterface.changeColumn("Users", "chats", {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [], // Set your desired default value here
      })
    } else {
      // If the column doesn't exist, add it with the default value
      await queryInterface.addColumn("Users", "chats", {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: [], // Set your desired default value here
      })
    }
  },

  async down(queryInterface, Sequelize) {
    // If needed, add commands to revert the changes made in the up method
    // Example: await queryInterface.removeColumn('Users', 'chats');
  },
}
