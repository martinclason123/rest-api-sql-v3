// This file uses the basic-auth NPM package to parse the user credentials

const express = require('express');

// requires basic-auth package be installed
const auth = require('basic-auth');

//package for hashing passwords
const bcrypt = require('bcrypt');

// Imports the user model
const models = require('./models');
const { User } = models;


// Middleware to authenticate the request using Basic Authentication.
exports.authenticateUser = async (req, res, next) => {
    let message;
    
    // Parse the user's credentials from the Authorization header.
    const credentials = auth(req);
    // Conditional to make sure credentials could be parsed
    if (credentials) {
      const user = await User.findOne({ where: {emailAddress: credentials.name} });
      //Makes sure a user match was found
      if (user) {
        const authenticated = bcrypt
          // Compares the provided password with the password in the db
          .compareSync(credentials.pass, user.password);
        if (authenticated) {
          console.log(`Authentication successful for ${user.firstName} ${user.lastName}`);
  
          // Store the user on the Request object.
          req.currentUser = user;
        } else {
          message = `Authentication failure for username: ${user.emailAddress}`;
        }
      } else {
        message = `User not found for username: ${credentials.emailAddress}`;
      }
    } else {
      message = 'Auth header not found';
    }
    // If any errors are present, it is logged and a 401 is sent to the user
    if(message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    } else {
        next();
    }
}

