const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    message: {
        type: String,
        required:[true,'A rule must have a description']
    },
    status: {
        type: String,
        required: [true, 'A query must have a status'],
        default: 'pending',
        enum: {
            values: ['pending','solved','rejected'],
            message: "query status must be  'pending','solved' or 'rejected' "
        }
    },
    queryType: {
        type: String,
        required: [true, 'A query must have a type !'],
        enum: {
            values:['maintenance','regular']
        }
    },
    createdUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'Student',
        required: [true, 'A query must belong to a User !']
    },
    fowardedByUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'AdminUser'
    },
    subWardenComment: {
      type:String  
    },
    academicWardenComment: {
      type:String  
    },
    dvcComment: {
      type:String  
    },
    vcComment: {
      type:String  
    },
    fowardedToUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'AdminUser',
    },
    solvedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'AdminUser'
    },
    solvedComment: {
      type:String  
    },
    rejectedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'AdminUser',
    },
    rejectedComment: {
        type:String
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

querySchema.pre(/^find/, function (next) {
    this.populate({
        path: 'createdUser',
        select: 'firstName lastName initials studentNo faculty level'
    });

    this.populate({
        path: 'fowardedByUser',
        select: 'name title role '
    });
    
    this.populate({
        path: 'fowardedToUser',
        select: 'name title role '
    });
    this.populate({
        path: 'solvedBy',
        select: 'name title role '
    });
    this.populate({
        path: 'rejectedBy',
        select: 'name title role '
    });
    
    next();
});

const Query = mongoose.model('query', querySchema);
module.exports = Query;