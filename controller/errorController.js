const AppError = require('../utils/appError');

const sendErrorDev = (err, res , req) => {
    if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
    }  else {
        // RENDERED WEBSITE
        console.error('ERROR 💥', err); 
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
};
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}
const sendErrorProd = (err, res , req) => {
    if (req.originalUrl.startsWith('/api')) {
    // Operational , trusted error : send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    } else {
        // 1. Log error
        console.error('ERROR 💥', err);
        // 2. Send generic message
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong'
        });
    } 
}else {
    // RENDERED WEBSITE
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: err.message
        });
    }
        // 1. Log error
        console.error('ERROR 💥', err);
        // 2. Send generic message
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            msg: 'Please try again later.'
        });
}
};




module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
        err.status = err.status || 'error';
        if (process.env.NODE_ENV === 'development') {
            sendErrorDev(err, res , req);
        } else if (process.env.NODE_ENV === 'production') {
            let error = { ...err };
            error.message = err.message;
         if (error.name === 'CastError')  error = handleCastErrorDB(error);
         if (error.code === 11000) error = handleDuplicateFieldsDB(error);
         if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
            // Operational , trusted error : send message to client
         if (error.name === 'JsonWebTokenError') error = new AppError('Invalid token. Please log in again!', 401);   
         if (error.name === 'TokenExpiredError') error = new AppError('Your token has expired! Please log in again.', 401);
            sendErrorProd(error, res);
        }
    }
