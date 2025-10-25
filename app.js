const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const app = express();
const fs = require('fs');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const xss = require('xss-clean');
const jwt = require('jsonwebtoken');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const tourRouter = require('./routes/toursRoute');
const reviewRouter = require('./routes/reviewRoute');
const bookingRoute = require('./routes/bookingRoute');
const viewRouter = require('./routes/viewRoute');
const morgan = require('morgan');
const userRouter = require('./routes/userRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());
// Development logging
if (process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); // Middleware for logging HTTP requests
   
}
// Limit requests from same API
const limiter = rateLimit({
    max : 100 ,
    windowMs : 60 * 60 * 1000 ,
    message : 'Too many requests from this IP , please try again in an hour!'
});
app.use('/api' , limiter);

// 1) MIDDLEWARES

// Body parser , reading data from body into req.body
app.use(express.json({
    limit : '10kb'
})); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
// Data sanitization against NoSQL query injection
app.use(mongoSanitize());
// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist : [
        'duration' ,
        'ratingsQuantity' ,
        'ratingsAverage' ,
        'maxGroupSize' ,
        'difficulty' ,
        'price'
    ]
}));
app.use(compression());
// serving static files
app.use(
    (req, res, next) => {
        console.log('hello from the middleware!');
        next();
    }
);
app.use(express.static(path.join(__dirname, 'public'))); // Middleware to serve static files


app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});
//  app.get('/', (req, res) => {
//     res.status(200).json({ message: 'Hello, World!' });
// });

// app.post('/', (req, res) => {
//     res.status(201).json({ message: 'Data received' });

// });


// enhance the code 

// 2) ROUTE HANDLERS
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`));

// USERS


// 3) ROUTES
    app.use('/', viewRouter);
    app.use('/api/v1/tours', tourRouter);
    app.use('/api/v1/users', userRouter);
    app.use('/api/v1/reviews', reviewRouter);
    app.use('/api/v1/bookings', bookingRoute);
    // app.all('*', (req, res, next) => {
    //     // res.status(404).json({
    //     //     status: 'fail',
    //     //     message: `Can't find ${req.originalUrl} on this server!`
    //     // });
    //     // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    //     // err.status = 'fail';
    //     // err.statusCode = 404;
    //        next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    // });
    // app.all('*', (req, res, next) => {
    //     next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
    // });
    app.use(globalErrorHandler);
    module.exports = app;