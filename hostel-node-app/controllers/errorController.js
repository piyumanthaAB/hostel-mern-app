const AppError = require("../utils/appError");

// send errors in development environment
const sendErrDev = (err,res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack:err.stack
    })
}

// send errors in production environment
const sendErrorProd = (err, res) => {

    // Operational trusted errors: send error message to the client
    if (err.isOperational) {
        
        // 1) log error
        console.log({
            "====💥💥 ERROR 💥💥  ====": err
        });

        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        // Programming or other unknown error: do not sent error details to the client

        // 1) log error
        console.log({
            "==== 💥💥 ERROR 💥💥 ====": err
        });

        // 2) send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong! Please Try again later'
        })
    }

}


// handle mongo DB object ID 'CastError' in production
const handleCastErrorDB = (error) => {
    const message = `Invalid ${error.path}: ${error.value}`
    
    return (
        new AppError(message, 400)
    )
}

// handle mongo DB unique fields duplication error in production
const handleDuplicateFieldErrorDB = (error) => {
    let message = `Duplicate field =>  `

    for (const key in error.keyValue) {

        message+=`${key}: ${error.keyValue[key]}`
    }

    
    return (
        new AppError(message,400)
    )
}

// handle mongo DB validation  error in production
const handleValidationErrorDB = (error) => {
    
    let message = `Validation Error ;( ${error._message}`

    return (
        new AppError(message,400)
    )
}

// handle JWT invalid signature  error in production
const handlerJWTError = () => {
    return (new AppError('Invalid Token. Please login again!', 401));
}

// handle JWT expired  error in production
const handlerJWTExpiredError = () => {
    return (new AppError('Your Token has expired. Please login again!', 401));
}

// handle Multer File size exceed error
const handleMulterFileSizeError = () => {
    return (new AppError('Image size is too large. Please upload an image with size lower than 1MB',400))
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'

    if (process.env.NODE_ENV === 'development') {
        sendErrDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {

        let error = { ...err }
        error.message = err.message;
        
        if (error.valueType === 'string') {
            error = handleCastErrorDB(error);
        }
        if (error.code === 11000) {
            error = handleDuplicateFieldErrorDB(error);
        }

        if (error._message === 'Validation failed') {
            error = handleValidationErrorDB(error);
        }

        if (error.name === 'JsonWebTokenError') {
            error = handlerJWTError();
        }
        if (error.name === 'TokenExpiredError') {
            error = handlerJWTExpiredError();
        }

        if (error.name === 'MulterError' && error.code === 'LIMIT_FILE_SIZE') {
            error=handleMulterFileSizeError()
        }

        sendErrorProd(error, res);
    }
    
    
}