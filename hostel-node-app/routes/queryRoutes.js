const express = require('express');

const queryController = require('./../controllers/queryController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);
// router.use(authController.restrictTo('student'));

router.route('/')
    .get(authController.restrictTo('admin','sub_wardner', 'academic_wardner', 'dvc'),queryController.getAllQueries)
    .post(authController.restrictTo('student'), queryController.createQuery)
    
// router.route('/forward/:qID')
//     .patch(authController.restrictTo('sub_wardner', 'academic_wardner', 'dvc'), queryController.forwardQuery)

router.route('/reject/:qID')
    .patch(authController.restrictTo('sub_wardner', 'academic_wardner', 'dvc'),queryController.rejectQuery)
router.route('/solve/:qID')
    .patch(authController.restrictTo('sub_wardner', 'academic_wardner', 'dvc'),queryController.solveQuery)

module.exports = router;