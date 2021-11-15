const mongoose = require('mongoose');
var validator = require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A user must have a name']
    },
    email: {
        unique: true,
        type: String,
        required: [true, 'A user must have an email'],
        lowercase: true,
        validate: {
            validator: function (val) {
                return validator.isEmail(val);
            },
            message:'Please provide a valid email'
        }
    },
    role: {
        type: String,
        required: [true, 'A user must have a role'],
        enum: {
            values: ['admin', 'vc', 'dvc', 'warden', 'sub_warden', 'student'],
            message: "User role must be one of : [ 'admin', 'vc', 'dvc', 'warden', 'sub_warden', 'student' ]"
        }
    },
    title: {
        type: String,
        required: [true, 'A user must have a title'],
        enum: {
            values: ['dr', 'mr', 'mrs', 'miss'],
            message: "User title must be one of : ['dr', 'mr', 'mrs', 'miss']"
        }
    },
    password: {
        type: String,
        required: [true, 'A user must have a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'A user must confirm the password'],
        validate: {
            validator: function (val) {
                return this.password === val;
            },
            message: "passwords doesn't match"
        },
        select: false
    },
    userStatus: {
        type: Boolean,
        default: true,
        select:false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;