const express = require('express');
const studentController = require('../controllers/studentController');
const authController = require('../controllers/authController');
const multer = require('multer');

// const upload = multer();

const router = express.Router();

router.use(authController.protect);

// for currently logged in student to update his/her profile photo
router.route('/updateMyPhoto')
    .patch(authController.restrictTo('student'),studentController.uploadStudentImage,studentController.updateMyPhoto)

// for currently logged in student to update his/her profile data (not photo)
router.route('/updateMe')
    .patch(authController.restrictTo('student'),studentController.updateMyProfile)

router.use(authController.restrictTo('admin'));

router.route('/')
    .get(studentController.getAllStudents)
    .post(studentController.createStudent)

router.route('/:id')
    .get(studentController.getStudent)
    .patch(studentController.updateStudent)
    .delete(studentController.removeStudent)

router.route('/multiple')
    .post(studentController.textUpload, studentController.createMultipleUsers)
    
module.exports= router;