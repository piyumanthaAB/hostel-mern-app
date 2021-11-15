const Student = require('../models/StudentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const validator = require("email-validator");
const helpers = require('./../utils/helpers');
const multer = require('multer');

// =================== MULTER middleware configuration start ===========================

// save images in the public folder
const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/students');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        cb(null, `student_${Date.now()}.${ext}`);
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

// check image file size
const multerLimiter = {
    fileSize:1000000
}


const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
    limits:multerLimiter
});
const textUpload = multer();


exports.uploadStudentImage = upload.single('photo');
exports.textUpload = textUpload.single('txt');

// =================== MULTER middleware configuration END ===========================

// generate multiple student accounts on DB
exports.createMultipleUsers = catchAsync(async (req, res, next) => {
    // console.log(req.body);
    // console.log(req.file);
    // console.log(req.user);


    const password = process.env.DEFAULT_STUDENT_PASSWORD;

    const emailTextFileData = Buffer.from(req.file.buffer).toString('utf-8');

    const emailList = emailTextFileData.split(',')

    for (let i = 0; i < emailList.length; i++) {
        
        if (!validator.validate(emailList[i])) {
            return next(new AppError(`Invalid email at position < ${i} > : ${emailList[i]}`, 400));
        }
        
    }

    for (let i = 0; i < emailList.length; i++){
        const student = await Student.create({
            email: emailList[i],
            password,
            passwordConfirm: password,
            photo:`${req.protocol}://${req.get('host')}/students/default.png`
        });
    }

    res.status(200).json({
        status: 'success',
        emailList
    })
});

// create a single student account
exports.createStudent = catchAsync(async (req, res, next) => {
    
    const { email } = req.body;
    const password = process.env.DEFAULT_STUDENT_PASSWORD;

    const student = await Student.create({ email, password, passwordConfirm: password });

    res.status(201).json({
        status: 'success',
        data: {
            student
        }
    });
})

// get all students accounts
exports.getAllStudents = catchAsync(async (req, res, next) => {
    const students = await Student.find({ active: true });

    res.status(200).json({
        status: 'success',
        results:students.length,
        data: {
            students
        }
    })
})

// get a single student document
exports.getStudent = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const student = await Student.find({_id:id,active:true});

    if (student.length===0) {
        return next(new AppError('No student found for this ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            student
        }
    })
})

// update student account [for ADMIN] (need to change to get JSON instead form data)
exports.updateStudent = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const restrictedFields = ['email', 'password', 'passwordChangedAt', 'passwordResetToken', 'passwordResetExpires','role'];

    // generate an error message if admin-users  try to update any of 'Restricted Fields' defined above
    const errMsg = helpers.restrictedFieldsError(restrictedFields, req.body, next);
    
    if (errMsg) {
        return next(new AppError(errMsg, 403))
    }

    const updateData = req.body;
    
    const updatedStudent = await Student.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedStudent) {
        return next(new AppError('No user found for this ID', 404));
    }

    // should sent an email to the student notifying that his account has been updated by Uni Administration
    // function()

    res.status(200).json({
        status: 'success',
        data: {
            updatedStudent
        }
    })
})

// remove student account (update active status to ' false ')
exports.removeStudent = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    

    const student = await Student.findByIdAndUpdate(id, { active: false }, { new: true, runValidators: true });
    
    if (!student) {
        return next(new AppError('No student found for this ID', 404));
    }

    res.status(204).json({
        status: 'success',
        message: 'Student successfully removed !'
    });
})

// new controller to update student photo
exports.updateMyPhoto = catchAsync(async (req, res, next) => {

    // console.log(req.user);
    // console.log(req.file);

    const url = `${req.protocol}://${req.get('host')}/students/${req.file.filename}`;

    const updatedUser = await Student.findByIdAndUpdate(req.user.id, { photo: url }, { new: true, runValidators: true });

    
    res.status(201).json({
        status: 'success',
        message: 'photo updated successfully',
        data: {
            url
        }
    })
});

// for currently logged in Student to update his/her account
exports.updateMyProfile = catchAsync(async (req, res, next) => {
    
    // console.log({ current_student: req.user });
    // console.log({ req_body: req.body });

    const allowedFields = ['firstName', "lastName", "initials", "studentNo", "faculty", "level", "roomNo", "hostelFee", "specialRemarks"];

    const id = req.user._id;
    const data = helpers.allowFieldsFilter(allowedFields, req.body);

    // console.log({filteredBody:data});
    
    const updatedStudent = await Student.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    
    res.status(201).json({
        status: 'success',
        message: 'Student updated successfully!',
        data: {
            updatedStudent
        }
    })

})