const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const AdminUser = require('../models/AdminUsersModel');

// create a new admin user
exports.createAdminUser = catchAsync(async (req, res, next) => {
  
    const userData = req.body

    const user = await AdminUser.create(userData);

    res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: {
            user
        }
    })
    
})

// get a single admin user
exports.getAdminUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await AdminUser.find({_id:id,active:true});

    if (user.length===0) {
        return next(new AppError('No user found for this ID',404))
    }

    res.status(200).json({
        status: 'success',
        data: {
            user
        }
    })
})

// get all admin users
exports.getAdminUsersAll = catchAsync(async (req, res, next) => {
    const users = await AdminUser.find({ active: true });

    res.status(200).json({
        status: 'success',
        results:users.length,
        data: {
            users
        }
    })
});

// update admin users (done by system admin)
exports.updateAdminUser = catchAsync(async (req, res, next) => {
    const { name, title, userType, hostel_IDs ,role} = req.body;
    const { id } = req.params;

    const updateData = { name, title, userType, hostel_IDs ,role}

    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError('This route is not for password update.', 403))
    }
    if (req.body.email) {
        return next(new AppError('Email is restricted. Cannot update email.', 403))
    }

    const updatedUser = await AdminUser.findByIdAndUpdate(id, updateData, { new: true, runValidators: true })

    if (!updatedUser) {
        return next(new AppError('No user found for this ID', 404))
    }

    res.status(200).json({
        status: 'success',
        message: 'User updated successfully !',
        data: {
            updatedUser
        }
    });


});

// delete admin users
exports.deleteAdminUser = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const user = await AdminUser.findByIdAndUpdate(id,{ active: false },{new:true,runValidators:true});

    if (!user) {
        return next(new AppError('No user found for this ID', 404))
    }

    res.status(204).json({
        status: 'success',
        message: 'User deleted successfully !',
        data: {
            user
        }
    });
})