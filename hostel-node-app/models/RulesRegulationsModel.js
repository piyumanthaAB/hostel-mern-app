const mongoose = require('mongoose');

const rulesRegulationsSchema = new mongoose.Schema({
    description: {
        type: String,
        required:[true,'A rule must have a description']
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true
});

const RulesRegulations = mongoose.model('Rules_&_Regulations', rulesRegulationsSchema);
module.exports = RulesRegulations;