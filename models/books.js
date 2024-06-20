'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Books extends Model {
    static associate() {}
    toJSON() {
      return {
        ...this.get(),
        similaritySearch: undefined,
      };
    }
  }
  Books.init(
    {
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
      publicationDate: {
        type: DataTypes.DATEONLY,
      },
      genres: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: [],
      },
      similaritySearch: {
        type: DataTypes.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      underscored: true,
      tableName: 'books',
      modelName: 'Books',
      hooks: {
        afterCreate: async (data, options) => {
          let similaritySearch = sequelize.literal(
            `lower(coalesce(title, '') || ' ' || coalesce(author, ''))`
          );

          await data.update({ similaritySearch });
        },

        afterSave: async (data, options) => {
          data.similaritySearch = sequelize.literal(
            `lower(coalesce(title, '') || ' ' || coalesce(author, ''))`
          );

          data.save();
        },
      },
    }
  );

  return Books;
};
