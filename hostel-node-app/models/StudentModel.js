const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    initials: {
        type: String,
        trim: true
    },
    studentNo: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: [true, 'A user must have an email'],
        lowercase: true,
        validate: {
            validator: function (val) {
                return validator.isEmail(val);
            },
            message: 'Please provide a valid email'
        },
        immutable: true
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
    committeeMember: {
        type: Boolean,
        default: false
    },
    committee: {
        type: String,
        enum: {
            values: ['committee_1', 'committee_2', 'committee_3', 'none'],
            message: "student committee must be one of : ['committee_1', 'committee_2', 'committee_3','none']"
        },
        default: 'none'
    },
    faculty: {
        type: String,
        enum: {
            values: [
                'agriculture', 'allied health science', 'engineering',
                'fisheries and marine science', 'humanities and social science', 'management and finance', 'medicine', 'science', 'technology'
            ],
            message: `faculty must be one of these values: < 'agriculture', 'allied health science', 'engineering',
            'fisheries and marine science', 'humanities and social science','management and finance','medicine','science','technology' > `
        }
    },
    level: {
        type: Number,
        min: [1, "level must above or equal 1"],
        max: [4, "level must below or equal 4"],
        
    },
    photo: {
        type: String
    },
    // hostel: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'Hostel',
    //     required: [true, 'A student must belong to a hostel !']
    // },
    roomNo: {
        type: String,
        trim: true
    },
    hostelFee: {
        type: Boolean
    },
    specialRemarks: {
        type: String
    },
    role: {
        type: String,
        immutable: true,
        default: 'student',
        enum: {
            values: ['student'],
            message: "Cannot allow to  change student role to any other role."
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

// ## this middlware populate hostel field when user request students
// achievementSchema.pre(/^find/, function (next) {
//     this.populate({
//         path: 'user',
//         select: 'name department title'
//     });
    
//     next();
// });

// encrypt password before saving the doc to the DB
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) next();

    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;

    next();
})

// update paswordChangedAt property
studentSchema.pre('save', function (next) {

    if (!this.isModified('password') || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 2000;
    next();

})

// check if user entered password match the password in DB 
studentSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword,userPassword)
}

// if password changed after token is issued, this function return TRUE
studentSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        // console.log(changedTimestamp,JWTTimestamp);

        return JWTTimestamp < changedTimestamp; // 100 < 200  returns TRUE
    }

    // false means NOT changed password !
    return false;
}

// this function create password reset token
studentSchema.methods.createPasswordesetToken = function () {

    const resetToken = crypto.randomBytes(32).toString('hex');

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    // console.log({resetToken},this.passwordResetToken);

    return resetToken;
}

const Student = mongoose.model('Student', studentSchema);
module.exports = Student;

// need to validate committee member and committee value when updating those values