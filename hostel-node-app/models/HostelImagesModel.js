const mongoose = require('mongoose');

const hostelImageSchema = new mongoose.Schema({
    url: {
        type: String,
        required: [true, 'An image must have a URL'],
        unique:true
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
})

const HostelImages = mongoose.model('HostelImages', hostelImageSchema);
module.exports = HostelImages;