const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.route('/login')
    .post(authController.login)

router.route('/forgotPassword')
    .post(authController.forgotPassword)

router.route('/resetPassword/:resetToken')
    .patch(authController.resetPassword)

router.route('/updateMyPassword')
    .patch(authController.protect, authController.updateMyPassword)

// router.route('/updateMyData')
//     .patch(authController.protect, authController.updateMyProfile)

module.exports = router;