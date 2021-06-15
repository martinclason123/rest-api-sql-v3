'use strict';

const express = require('express');
const { asyncHandler } = require('./async-handler');
// allows the req object to be parsed
// https://stackoverflow.com/questions/9177049/express-js-req-body-undefined
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const urlEncodedParser = bodyParser.urlencoded({extended:false});

// Imports the user model
const models = require('./models');
const { User, Course } = models;
const { authenticateUser } = require('./auth-user');

const router = express.Router();
// Route that returns the authenticated user
router.get('/users', authenticateUser, asyncHandler(async (req, res) => {
    const user = req.currentUser;
  
    res.setHeader({location: './'}).json({
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddress
    });
  }));

// Route that creates a new user.
router.post('/users', jsonParser, asyncHandler(async (req, res) => {
    try {
        console.log(req.body);
      await User.create(req.body);
      
      res.status(201).end();
    } catch (error) {
      if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => err.message);
        res.status(400).json({ errors });   
      } else {
        throw error;
      }
    }
  }));

  //return a list of all courses including the User that owns each course and a 200 HTTP status code.
router.get('/courses', asyncHandler(async(req,res) => {
    const courses = await Course.findAll({
        include: [
            {
                model: User,
                as: 'instructor',
            }
        ]
    });
    res.status(200).json(courses);
}))

//GET route that will return the corresponding course along with the User that owns that course and a 200 HTTP status code.
router.get('/courses/:id', asyncHandler(async(req,res) =>{
    const  course = await Course.findByPk(req.params.id, 
        {
            include: [
                {
                    model: User,
                    as: 'instructor',
                }
            ]
        }
        );
    if(!course){
        res.status(404).json({message: 'No such course'})
    }
    else{
        res.status(200).json(course);
    }
}))

// POST route that will create a new course, set the Location header to the URI for the newly created course, 
// and return a 201 HTTP status code and no content.
router.post('/courses',jsonParser, asyncHandler(async(req,res) => {
 const course = await req.body;

 if(!course){
    res.status(400).json({message: "No course information received"})

 }
 else {
    Course.create(course);
    res.status(201).end()
 }

}))

// PUT route that will update the corresponding course and return a 204 HTTP status code and no content.
router.put('/courses/:id',jsonParser, asyncHandler(async(req,res)=> {
    if(!req.params.id){
        res.status(400).json({message: "Course ID missing from request"})
      } else {
          const course = await Course.findByPk(req.params.id);
          if(!course){
              res.status(404).json({message: "Course not found"})
          } else{
              let selector = {
                  where: { id: req.params.id}
              }
              console.log(req.body)
              await Course.update(
                req.body,
                selector
              )
              res.status(204).end();
          }
      }
}))

//DELETE route that will delete the corresponding course and return a 204 HTTP status code and no content.
router.delete('/courses/:id',jsonParser, asyncHandler(async (req,res) => {
    const course = await Course.findByPk(req.params.id);
    if(!course){
        res.status(404).json({message: "Course not found"});
    } else {
        Course.destroy({
            where: {
                id: req.params.id
            }
        })
        res.status(204).end();
    }
}))

module.exports = router;