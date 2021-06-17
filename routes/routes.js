"use strict";
const express = require("express");
const router = express.Router();

// imports the middleware for handling async functions
const { asyncHandler } = require("../middleware/async-handler");
// allows the req object to be parsed
// https://stackoverflow.com/questions/9177049/express-js-req-body-undefined
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();

// Imports the models
const { User, Course } = require("../models");

// imports the middlware to perform authentication
const { authenticateUser } = require("../middleware/auth-user");

// Route that returns the authenticated user
router.get(
  "/users",
  authenticateUser,
  asyncHandler(async (req, res) => {
    const user = req.currentUser;

    // sets the location header to "/"
    res.setHeader("Location", "/");
    res.status(200).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      emailAddress: user.emailAddress,
    });
  })
);

// Route that creates a new user.
router.post(
  "/users",
  jsonParser,
  asyncHandler(async (req, res) => {
    try {
      await User.create(req.body);

      res.status(201).end();
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      } else {
        throw error;
      }
    }
  })
);

//return a list of all courses including the User that owns each course and a 200 HTTP status code.
//excluding password, and db timestamps
router.get(
  "/courses",
  asyncHandler(async (req, res) => {
    const courses = await Course.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
        },
      ],
    });
    res.status(200).json(courses);
  })
);

//GET route that will return the corresponding course along with the User that owns that course and a 200 HTTP status code.
router.get(
  "/courses/:id",
  asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: User,
          as: "user",
          attributes: { exclude: ["createdAt", "updatedAt", "password"] },
        },
      ],
    });
    if (!course) {
      res.status(404).json({ message: "No such course" });
    } else {
      res.status(200).json(course);
    }
  })
);

// POST route that will create a new course, set the Location header to the URI for the newly created course,
// and return a 201 HTTP status code and no content.
router.post(
  "/courses",
  jsonParser,
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    try {
      const course = await req.body;

      if (!course) {
        res.status(400).json({ message: "No course information received" });
      } else {
        await Course.create(course);
        res.status(201).end();
      }
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      }
    }
  })
);

// PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put(
  "/courses/:id",
  authenticateUser,
  jsonParser,
  asyncHandler(async (req, res) => {
    // validation on updates, as allowNull will not catch null values on update
    const user = req.currentUser;
    let message = [];

    if (!req.body.title) {
      message.push({ error: "Title is required" });
    }
    if (!req.body.description) {
      message.push({ error: "Description is required" });
    }
    if (message.length > 0) {
      res.status(400).json({ message });
    }
    try {
      const course = await Course.findByPk(req.params.id);
      if (!course) {
        res.status(404).json({ message: "Course not found" });
      } else {
        let selector = {
          where: { id: req.params.id },
        };
        // Does not allow users to change courses they do not own
        if (user.id !== course.userId) {
          res.status(400).json({ message: "You do not own this course" });
        }
        await Course.update(req.body, selector);
        res.status(204).end();
      }
    } catch (error) {
      if (
        error.name === "SequelizeValidationError" ||
        error.name === "SequelizeUniqueConstraintError"
      ) {
        const errors = error.errors.map((err) => err.message);
        res.status(400).json({ errors });
      }
    }
  })
);

//DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete(
  "/courses/:id",
  authenticateUser,
  jsonParser,
  asyncHandler(async (req, res) => {
    const course = await Course.findByPk(req.params.id);
    const user = req.currentUser;
    if (!course) {
      res.status(404).json({ message: "Course not found" });
    } else {
      // Does not allow users to delete courses they do not own
      if (user.id !== course.userId) {
        res.status(400).json({ message: "You do not own this course" });
      }
      Course.destroy({
        where: {
          id: req.params.id,
        },
      });
      res.status(204).end();
    }
  })
);

module.exports = router;
