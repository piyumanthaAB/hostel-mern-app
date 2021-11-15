const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const Student = require('../models/StudentModel');
const AdminUser = require('../models/AdminUsersModel');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

// user type shoud be either 'student' or 'adminUser'
const signToken = (id,userType) => {
    return jwt.sign({ id,userType }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
}

const createSendToken = (user, userType, statusCode, res) => {
    const token = signToken(user.id, userType);

    // console.log(token);

    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly:true
    }

    // send JWT in the cookie, if and only if browser connect using HTTPS
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        staus: 'success',
        data: {
            token
        }
    })
}


// user login authentication
exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1. check if email and password exists
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }

    

    // 2. check if user exist && password correct 
    const studentUser =await Student.findOne({ email }).select('+password +active');
    const adminUser = await AdminUser.findOne({ email }).select('+password +active');

    let userType='';
    let correct=null;

    if (studentUser) {
        if (!studentUser.active) {
            return next(new AppError('This account has been deactivated . Contact system admin. ',403))
        }
        userType = 'student';
    } else if (adminUser) {
        if (!adminUser.active) {
            return next(new AppError('This account has been deactivated . Contact system admin. ',403))
        }
        userType = 'adminUser';


    }

    let token = '';


    switch (userType) {
        case 'student':
            correct = await studentUser.correctPassword(password, studentUser.password);
            // if both passwords match,generate token
            if (correct) {
                // token = signToken(studentUser._id,'student');
                createSendToken(studentUser, 'student', 200, res);
            }
            break;
        case 'adminUser':
            correct = await adminUser.correctPassword(password, adminUser.password);
            // if both passwords match,generate token
            if (correct) {
                // token = signToken(adminUser._id,'adminUser');
                createSendToken(adminUser, 'adminUser', 200, res);

            }
            break;
    
        default:
            return next(new AppError('Invalid email or password', 401));
    };

    if (!correct) {
        return next(new AppError('Invalid email or password', 401));
    }
    
    // 3. if everything ok, send token to client
    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         token
    //     }
    // })
})

// protect certain routes from unauthorized access
exports.protect = catchAsync(async(req, res, next)=> {
    // console.log(req.headers);

    let token;

    // 1. check whether if token exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // console.log(token);

    if (!token) return next(new AppError('You are not logged in. Please logIn to access data', 401));

    // 2. verify token
    const decoded = await promisify(jwt.verify)(token,process.env.JWT_SECRET);

    // console.log(decoded);

    // 3. check if user still exists
    // need to add which type of user to determine which model to use

    let freshUser;

    switch (decoded.userType) {
        case 'student':
            freshUser = await Student.findById(decoded.id);
            break;
        case 'adminUser':
            freshUser = await AdminUser.findById(decoded.id);
            break;
    
        default:
            next(new AppError('Invalid token.please login again !', 401));
            break;
    }

    // console.log({freshUser});
    
    if (!freshUser) {
        return next(new AppError('The user belonging to this token does not exist.',401))
    }

    //4. check if userchanged password after token issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password, Please log in again !', 401))
    }

    // grant access for protected routes

    req.user = freshUser;
    next();
})

// restrict certain actions to specific users
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You don\'t have permission to perform this action !', 403));
        }

        next();
    }
}

// create random token and send it to the  email provided with POST request
exports.forgotPassword = catchAsync(async (req, res, next) => {
    
    // 1. get user based on provided Email
    const studentUser = await Student.findOne({ email: req.body.email });
    const adminUser = await AdminUser.findOne({ email: req.body.email });

    if (!studentUser && !adminUser) {
        return next(new AppError('User doesn\'t exist.', 400));
    }

    // 2. generate the random reset token
    let token = '';
    let email=''

    if (studentUser) {
        token = studentUser.createPasswordesetToken();
        await studentUser.save({ validateBeforeSave: false });
        email=studentUser.email
        // await studentUser.save();
    } else {
        token = adminUser.createPasswordesetToken();
        await adminUser.save({ validateBeforeSave: false });
        email=adminUser.email
        // await adminUser.save();
    }



    // 3. send it to users email
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${token}`
    const message = `Forgot password? Submit a PATCH request to the ${resetUrl} with your new password
    and passwordConfirm \n If you didn't forget your password, Ignore this`

    try {
        await sendEmail({
            email,
            subject: ' Your password reset token (valid only for 10 minutes)',
            message
        });
    
        res.status(200).json({
            status: 'success',
            message: 'Token has been sent to the email. Check inbox ;)'
        })
        
    } catch (error) {

        if (studentUser) {
            studentUser.passwordResetToken = undefined;
            studentUser.passwordResetExpires = undefined;
            await studentUser.save({ validateBeforeSave: false });
            // await studentUser.save();
        } else {
            adminUser.passwordResetToken = undefined;
            adminUser.passwordResetExpires = undefined;
            await adminUser.save({ validateBeforeSave: false });
            // await adminUser.save();
        }
        return next(new AppError('There was an Error trying sending email. Try again later', 500))
    }


   
});

// allow users to reset , if password is forgot
exports.resetPassword = catchAsync(async (req, res, next) => {

    const { resetToken } = req.params;
    let userType = '';
    let token = ''

    // 1. get user, based on the token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    const studentUser = await Student.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });
    const adminUser = await AdminUser.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    // 2. if token has not expired and user exist, set the new password
    if (!studentUser && !adminUser) {
        return next(new AppError('Token has expired or invalid ! Try again', 400))
    }

    if (studentUser) {
        userType = 'student';
        studentUser.password = req.body.password;
        studentUser.passwordConfirm = req.body.passwordConfirm;
        studentUser.passwordResetToken = undefined;
        studentUser.passwordResetExpires = undefined;
        await studentUser.save();

        createSendToken(studentUser, 'student', 201, res);


        // token = signToken(studentUser._id, 'student');
    } else {
        userType = 'adminUser';
        adminUser.password = req.body.password;
        adminUser.passwordConfirm = req.body.passwordConfirm;
        adminUser.passwordResetToken = undefined;
        adminUser.passwordResetExpires = undefined;
        await adminUser.save();

        // token = signToken(adminUser._id, 'adminUser');
        createSendToken(adminUser, 'adminUser', 201, res);


    }

    // 3. update changedPasswordAT property for the user
    
    // 4. log the user in send JWT
    // res.status(201).json({
    //     status: 'success',
    //     message: 'Password reset successfull.',
    //     data: {
    //         token
    //     }
    // })
})

// allow " logged in " users to update their passwords 
exports.updateMyPassword = catchAsync(async (req, res, next) => {

    let token;
    
    // 1. get user form collection
    const studentUser = await Student.findById(req.user.id).select('+password');
    const adminUser = await AdminUser.findById(req.user.id).select('+password');

    // 2. check if POSTed password is correct
    if(studentUser){
        if (!(await studentUser.correctPassword(req.body.currentPassword,studentUser.password))) {
            return next(new AppError('You\'re current password is incorrect !', 401));
        }
    }
    if(adminUser){
        if (!(await adminUser.correctPassword(req.body.currentPassword,adminUser.password))) {
            return next(new AppError('You\'re current password is incorrect !', 401));
        }
    }

    // 3. If so, update password
    if (studentUser) {
        studentUser.password = req.body.password;
        studentUser.passwordConfirm = req.body.passwordConfirm;
        await studentUser.save();

        // token = signToken(req.user.id, 'student');
        createSendToken(studentUser, 'student', 201, res);

    }
    if (adminUser) {
        adminUser.password = req.body.password;
        adminUser.passwordConfirm = req.body.passwordConfirm;
        await adminUser.save();

        // token = signToken(req.user.id, 'adminUser');
        createSendToken(adminUser, 'adminUser', 201, res);

    }
    
    // 4. Log user in, send JWT

    // res.status(200).json({
    //     status: 'succes',
    //     message: 'Password udated successfuly!',
    //     data: {
    //         token
    //     }
    // })



})

// allow " logged in " users to udate their user profile data
// exports.updateMyProfile = catchAsync(async (req, res, next) => {
    
//     if(req.body.password || req.body.passwordConfirm){
//         return next(new AppError('This route is not for update password. Use /updateMyPassword to update passowrds. ', 400));
//     }

//     const studentUser = await Student.findById(req.user.id);
//     const adminUser = await AdminUser.findById(req.user.id);

//     res.status(201).json({
//         status: 'succes',
//         message: 'Profile data updated successfully',
//         data: {
            
//         }
//     })
// })