"use strict";
const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  class Course extends Sequelize.Model {}

  Course.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false, // null values not allowed
        unique: {
          msg: "That email already exists",
        },
        validate: {
          notNull: { 
            msg: "Title is required",
          },
          notEmpty: {
            msg: "Title cannot be an empty string", // empty strings not allowed
          },
        },
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false, // null values not allowed
        validate: {
          notNull: {
            msg: "Description is required",
          },
          notEmpty: {
            msg: "Description cannot be an empty string", // empty strings not allowed
          },
        },
      },
      estimatedTime: {
        type: Sequelize.STRING,
      },
      materialsNeeded: {
        type: Sequelize.STRING,
      },
    },
    { sequelize }
  );
  // one-to-one association between the Course and User models
  Course.associate = (models) => {
    Course.belongsTo(models.User, {
      as: "user", // alias
      foreignKey: {
        fieldName: "userId",
        allowNull: false,
      },
    });
  };

  return Course;
};
