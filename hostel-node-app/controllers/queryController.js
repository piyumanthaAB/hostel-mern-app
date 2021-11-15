const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const Query = require('./../models/QueryModel');

// this function is to create a query document
exports.createQuery = catchAsync(async (req, res, next) => {
    
    const { message } = req.body;
    const createdUser = req.user._id;
    const { queryType } = req.body;

    const queryData = { message, createdUser, queryType };

    // console.log(queryData);

    const query = await Query.create(queryData);

    res.status(201).json({
        status: 'success',
        message: 'Query created successfully!',
        data: {
            query
        }
    })

})

// this function is to get all the query documents from DB
exports.getAllQueries = catchAsync(async (req, res, next) => {
    
    const queries = await Query.find();

    res.status(200).json({
        status: 'success',
        results:queries.length,
        data: {
            queries
        }
    })
})

// this function is to forward a query from one user to another user
exports.forwardQuery = catchAsync(async (req, res, next) => {
    
    const queryID = req.params.qID;
    const fowardedByUser = req.user._id;
    const fowardedToUser = req.body.fowardedToUser;
    const forwardedComment = req.body.forwardedComment;

    if (!fowardedToUser) {
        return next(new AppError('Query must have the ID of the user, that query is being forwarded to.'), 400);
    }
    if (!forwardedComment) {
        return next(new AppError('Query must have the fowarding comment!.'), 400);
    }



    const data = { fowardedByUser, fowardedToUser ,forwardedComment};

    // console.log(data);

    const forwardedQuery = await Query.findByIdAndUpdate(queryID, data, { new: true, runValidators: true });

    res.status(201).json({
        status: 'success',
        message: 'query has been forwarded successfully!',
        data: {
            forwardedQuery
        }
    })



})

//this function is for rejecting a query
exports.rejectQuery = catchAsync(async (req, res, next) => {
    
    const queryId = req.params.qID;

    const status = 'rejected';
    const rejectedBy = req.user._id;
    const { rejectedComment } = req.body;

    const data = { status, rejectedBy, rejectedComment }
    
    const query = await Query.findById(queryId);

    if (query.status === 'rejected') {
        return next(new AppError('This query has been already  rejected !. Cannot solve ! ', 400));
    }
    if (query.status === 'solved') {
        return next(new AppError('This query has been already  solved !.  ', 400));
    }
    if (!rejectedComment) {
        return next(new AppError('Query must have a comment when rejecting!', 400));
    }

    const rejectedQuery = await Query.findByIdAndUpdate(queryId, data, { new: true, runValidators: true });

    if (!rejectedQuery) {
        return next(new AppError('No query is found for this ID !', 404));
    }
   

    res.status(201).json({
        status: 'success',
        message: 'Query has been rejected successfully!',
        data: {
            rejectedQuery
        }
    })

})
//this function is for solving a query
exports.solveQuery = catchAsync(async (req, res, next) => {
    
    const queryId = req.params.qID;

    const status = 'solved';
    const solvedBy = req.user._id;
    const { solvedComment } = req.body;

    const data = { status, solvedBy, solvedComment }
    
    const query = await Query.findById(queryId);

    if (query.status === 'rejected') {
        return next(new AppError('This query has been already  rejected !. Cannot solve ! ', 400));
    }
    if (query.status === 'solved') {
        return next(new AppError('This query has been already  solved !.  ', 400));
    }

    if (!solvedComment) {
        return next(new AppError('Query must have a comment when solving!', 400));
    }

    // update the query status to solved
    const solvedQuery = await Query.findByIdAndUpdate(queryId, data, { new: true, runValidators: true });

    if (!solvedQuery) {
        return next(new AppError('No query is found for this ID !', 404));
    }
    

    res.status(201).json({
        status: 'success',
        message: 'Query has been solved successfully!',
        data: {
            solvedQuery
        }
    })

})