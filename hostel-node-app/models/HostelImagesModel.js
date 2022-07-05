const mongoose = require('mongoose');

const hostelImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'An image must have a URL'],
        unique:true
    },
    hostelLocation: {
        type: String,
        required: [true, 'A hostel image must have a location'],
        enum: {
            values: ['maddawatta', 'eliyakanda', ],
            message: "student committee must be one of : ['maddawatta', 'eliyakanda',]"
        }
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

const HostelImages = mongoose.model('HostelImages', hostelImageSchema);
module.exports = HostelImages;