'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate() {}
    toJSON() {
      return {
        ...this.get(),
        verificationCode: undefined,
        refreshToken: undefined,
        similaritySearch: undefined,
        password: undefined,
      };
    }
  }
  Users.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: 'user',
        validate: {
          isIn: {
            args: [['user', 'admin']],
            msg: 'Must be valid type',
          },
        },
      },
      verificationCode: {
        type: DataTypes.STRING,
      },
      refreshToken: {
        type: DataTypes.STRING,
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
      tableName: 'users',
      modelName: 'Users',
      hooks: {
        afterCreate: async (data, options) => {
          let similaritySearch = sequelize.literal(
            `lower(coalesce(username, '') || ' ' || coalesce(email, ''))`
          );

          await data.update({ similaritySearch });
        },

        afterSave: async (data, options) => {
          data.similaritySearch = sequelize.literal(
            `lower(coalesce(username, '') || ' ' || coalesce(email, ''))`
          );

          data.save();
        },
      },
    }
  );

  return Users;
};
