'use strict';
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');

module.exports = (sequelize) => {
    class User extends Sequelize.Model {}

    User.init({
        firstName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
              notNull: {
                msg: 'A first name is required'
              },
              notEmpty: {
                msg: 'Please provide a first name'
              }
            }
        },
        lastName: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
              notNull: {
                msg: 'A last name is required'
              },
              notEmpty: {
                msg: 'Please provide a last name'
              }
            }
        },
        emailAddress: {
            type: Sequelize.STRING,
            allowNull: false, // no null values allowed
            unique: {
              msg: 'That email already exists'
            },
            validate : {
              notNull: {
                msg: 'Email is required'
              },        
              isEmail: {
                msg: 'Please provide a valid email address'
              }
            }    
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            validate : {
                notNull: {
                  msg: 'email is required'   
                },
                notEmpty: {
                  msg: 'Please provide a password'
                }
            },
            set(val){
                //hashing the password
                const hashedPassword = bcrypt.hashSync(val,10);
                // sets the password value to the value of the hashed password, reventing storage of plain text passwords
                this.setDataValue('password',hashedPassword);
            },
        },
    },{ sequelize })
    
    User.associate = (models) => {
        User.hasMany(models.Course, {
          as: 'instructor', // alias
          foreignKey: {
            fieldName: 'userId',
            allowNull: false,
          },
        });
      };
      
    
    return User
}