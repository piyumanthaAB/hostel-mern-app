const RulesRegulations = require('../models/RulesRegulationsModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// create rules doc in DB
exports.createRule = catchAsync(async (req, res, next) => {

    const { rules } = req.body;

    const rulesArr = rules.split(',');

    for (let i = 0; i < rulesArr.length; i++) {
        
        await RulesRegulations.create({ description: rulesArr[i] });
        
    }

    res.status(201).json({
        status: 'success',
        message: 'rules added successfully !',
        data: {
            rulesArr
        }
    })
})

// get all rules documents from DB
exports.getAllRules = catchAsync(async (req, res, next) => {
    
    const rulesRegulations = await RulesRegulations.find();

    res.status(200).json({
        status: 'success',
        results: rulesRegulations.length,
        data: {
            rulesRegulations
        }
    })
})

// get a single rule doc for a given ID from DB
exports.getSingleRule = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const rule = await RulesRegulations.findById(id);

    if (!rule) {
        return next(new AppError('No rule found fr this ID'), 404);
    }

    res.status(200).json({
        status: 'success',
        data: {
            rule
        }
    })
});

// update a single rule for a given ID
exports.updateRule = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { description } = req.body;

    console.log(description);

    const updatedRule = await RulesRegulations.findByIdAndUpdate(id, {description}, { new: true, runValidators: true });

    if (!updatedRule) {
        return next(new AppError('No rule found for that ID'), 404);
    }

    res.status(200).json({
        status: 'success',
        message: 'rule updated successfully',
        data: {
            updatedRule
        }
    })
})

// delete a single rule for a given ID
exports.deleteRule = catchAsync(async (req, res, next) => {
    
    const { id } = req.params;

    const rule = await RulesRegulations.findByIdAndDelete(id);

    if (!rule) {
        return next(new AppError('No rule found for this ID'), 404);
    }

    res.status(204).json({
        status: 'success',
        data:{}
    })
})