const express = require('express');
const rulesRegulationsController = require('./../controllers/rulesRegulationsController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/')
    .get(rulesRegulationsController.getAllRules)
    .post(authController.protect,authController.restrictTo('admin','academic_wardner'),rulesRegulationsController.createRule)

router.route('/:id')
    .get(rulesRegulationsController.getSingleRule)
    .patch(authController.protect,authController.restrictTo('admin','academic_wardner'),rulesRegulationsController.updateRule)
    .delete(authController.protect,authController.restrictTo('admin','academic_wardner'),rulesRegulationsController.deleteRule)

module.exports= router;