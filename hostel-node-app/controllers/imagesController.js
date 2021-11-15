const HostelImages = require('../models/HostelImagesModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const fs = require('fs');
let { promisify } = require('util');

// save images in the public folder
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'hostel-node-app/public/gallery');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `hostel_image_${Date.now()}.${ext}`);
    }
});

// check whether if upload is an image or not
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image. Please upload only images!', 400), false);
    }
}


const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadGalleryImage = upload.single('photo');

// create image url doc n db
exports.createImage = catchAsync(async (req, res, next) => {

    // console.log(req.body);
    // console.log(req.file);

    const url = `${req.protocol}://${req.get('host')}/gallery/${req.file.filename}`;

    const photo = await HostelImages.create({ url });

    res.status(201).json({
        status: 'success',
        message: 'image uploaded successfully',
        data: {
            photo
        }
    })
});

// get all the images urls and send them
exports.getAllHostelImages = catchAsync(async (req, res, next) => {
    const images = await HostelImages.find();

    // console.log({headers:req.headers,host:req.get('host')});

    res.status(200).json({
        status: 'success',
        results:images.length,
        data: {
            images
        }
    })
});

// update an image 
exports.updateHostelImage = catchAsync(async (req, res, next) => {
    // 1. get image url from DB
    const { id } = req.params;
    const oldImage = await HostelImages.findById(id);

    if (!oldImage) {
        await promisify(fs.unlink)(`${__dirname}/../public/gallery/${req.file.filename}`);
        return next(new AppError('No image found for this ID', 404));
    }

    const oldImageName = oldImage.url.split('/')[4];

    const oldImageFilePath = `${__dirname}/../public/gallery/${oldImageName}`;

    //2. delete old image
    await promisify(fs.unlink)(oldImageFilePath);
    

    const newUrl = `${req.protocol}://${req.get('host')}/gallery/${req.file.filename}`;
    
    //3. update the url in DB
    const newImage = await HostelImages.findByIdAndUpdate(id, { url: newUrl }, { new: true, runValidators: true });

    res.status(201).json({
        status: 'success',
        message: 'image updated successfully',
        data: {
            newImage
        }
    })

});

// delete an image
exports.deleteHostelImage = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const image = await HostelImages.findById(id);

    if (!image) {
        return next(new AppError('No image found for this ID', 404));
    }

    const imageName = image.url.split('/')[4];

    const imageFilePath = `${__dirname}/../public/gallery/${imageName}`;

    // delete old image
    await promisify(fs.unlink)(imageFilePath);

    // delete image url from DB
    await HostelImages.findByIdAndDelete(id);

    res.status(204).json({
        status: 'success',
        message: 'image deleted uccessfully'
    });
})
