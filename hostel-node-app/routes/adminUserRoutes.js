const express = require('express');
const adminUserController = require('./../controllers/adminUserController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);
router.use(authController.restrictTo('admin'));

// for currently logged in admin user to update his/her profile data 
router.route('/updateMe')
    .patch()

router.route('/')
    .get(adminUserController.getAdminUsersAll)
    .post(adminUserController.createAdminUser)

router.route('/:id')
    .get(adminUserController.getAdminUser)
    .patch(adminUserController.updateAdminUser)
    .delete(adminUserController.deleteAdminUser)


module.exports = router;