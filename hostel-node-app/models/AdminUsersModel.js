const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const adminUsersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'An admin user must have a name']
    },
    title: {
        type: String,
        required: [true, 'An admin user must have a title'],
        enum: {
            values: ['dr', 'mr', 'mrs', 'miss'],
            message: "admin user ' title ' must be one of : ['dr', 'mr', 'mrs', 'miss']"
        }
    },
    email: {
        type: String,
        required: [true, 'An admin user must have an email'],
        unique: true,
        lowercase: true,
        validate: {
            validator: function (val) {
                return validator.isEmail(val);
            },
            message: 'Please provide a valid email'
        },
        immutable: true
        
    },
    role: {
        type: String,
        required: [true, 'An admin user must have a role !'],
        enum: {
            values: ['admin', 'sub_wardner', 'academic_wardner', 'dvc', 'vc'],
            message: "admin user ' role ' must be one of : ['admin','sub_wardner', 'academic_wardner', 'dvc', 'vc']"
        }
        
    },
    password: {
        type: String,
        required: [true, 'An admin user must have a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'An admin user must confirm the password'],
        validate: {
            validator: function (val) {
                return this.password === val;
            },
            message: "passwords doesn't match"
        },
        select: false
    },
    hostels: {
        type: Array,
        // validate: {
        //     // need to validate hostel IDs
        // }
        
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

// ## this function is to populate hostels when querying the admin users
// achievementSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'user',
//         select: 'name department title'
//     });
    
//     next();
// });

// encrypt password before saving the doc to the DB
adminUsersSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;

    next();
})

// update paswordChangedAt property
adminUsersSchema.pre('save', function (next) {

    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 2000;
    next();

})

// check if user entered password match the password in DB 
adminUsersSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword,userPassword)
}

// if password changed after token is issued, this function return TRUE
adminUsersSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        // console.log(changedTimestamp,JWTTimestamp);

        return JWTTimestamp < changedTimestamp; // 100 < 200  returns TRUE
    }

    // false means NOT changed password !
    return false;
}

// this function create password reset token
adminUsersSchema.methods.createPasswordesetToken = function () {

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    console.log({resetToken},this.passwordResetToken);

    return resetToken;
}

const AdminUser = mongoose.model('AdminUser', adminUsersSchema);
module.exports = AdminUser;