const express = require('express');

const imagesController = require('./../controllers/imagesController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/')
    .get(imagesController.getAllHostelImages)
    .post(authController.protect,authController.restrictTo('admin'),imagesController.uploadGalleryImage,imagesController.createImage)

router.route('/:id')
    .patch(authController.protect,authController.restrictTo('admin'),imagesController.uploadGalleryImage,imagesController.updateHostelImage)
    .delete(authController.protect,authController.restrictTo('admin'),imagesController.deleteHostelImage)

module.exports = router;