"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class File extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Association with User model
      File.belongsTo(models.User, {
        foreignKey: "createdBy",
        as: "creator", // Alias for the association
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  }

  File.init(
    {
      filename: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      metadata: {
        type: DataTypes.JSON, // Store metadata as JSON
        allowNull: true,
      },
      tags: {
        type: DataTypes.STRING, // Store tags as a comma-separated string
        allowNull: true,
      },
      views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      shareableLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Assumes there is a Users table
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      sequelize,
      modelName: "File",
    }
  );

  return File;
};
