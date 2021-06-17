"use strict";
const bcrypt = require("bcrypt");
const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  class User extends Sequelize.Model {}

  User.init(
    {
      firstName: {
        type: Sequelize.STRING,
        allowNull: false, // no null values allowed
        validate: {
          notNull: {
            msg: "A first name is required", 
          },
          notEmpty: {
            msg: "Please provide a first name", // No empty strings allowed
          },
        },
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false, // no null values allowed
        validate: {
          notNull: {
            msg: "A last name is required",
          },
          notEmpty: {
            msg: "Please provide a last name", // No empty strings allowed
          },
        },
      },
      emailAddress: {
        type: Sequelize.STRING,
        allowNull: false, // no null values allowed
        unique: {
          msg: "That email already exists", //no duplicate emails allowed
        },
        validate: {
          notNull: {
            msg: "Email is required",
          },
          isEmail: {
            msg: "Please provide a valid email address", //must follow conventional email format
          },
        },
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "password is required",
          },
          notEmpty: {
            msg: "Please provide a password",
          },
        },
        set(val) {
          if (val === "" || !val) {
            this.setDataValue("password", val);
          } else {
            //hashing the password
            const hashedPassword = bcrypt.hashSync(val, 10);
            // sets the password value to the value of the hashed password, reventing storage of plain text passwords
            this.setDataValue("password", hashedPassword);
          }
        },
      },
    },
    { sequelize }
  );
  // one-to-many association between the User and Course models
  User.associate = (models) => {
    User.hasMany(models.Course, {
      as: "user", // alias
      foreignKey: {
        fieldName: "userId",
        allowNull: false,
      },
    });
  };

  return User;
};
