'use strict';
module.exports = {
  async up(queryInterface, DataTypes) {
    await queryInterface.createTable('books', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      author: {
        type: DataTypes.STRING,
      },
      publication_date: {
        type: DataTypes.DATEONLY,
      },
      genres: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      similarity_search: {
        type: DataTypes.STRING,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    });
  },

  async down(queryInterface, DataTypes) {
    await queryInterface.dropTable('books');
  },
};
