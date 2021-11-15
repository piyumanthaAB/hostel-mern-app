const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const studentRouter = require('./routes/studentRoutes');
const adminUserRouter = require('./routes/adminUserRoutes');
const rulesRegulationsRouter = require('./routes/rulesRegulationsRoutes');
const imagesRouter = require('./routes/imagesRoutes');
const authRouter = require('./routes/authRoutes');
const queryRouter = require('./routes/queryRoutes');

const app = express();

// set security HTTP headers
app.use(helmet());


// Log API requests in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour !'
});
// Limit requests from same IP
app.use('/api', limiter);

app.use(cors());

// cookie parser, reading cookie data from cookie to req.cookie
app.use(cookieParser());

// set the public folder to serve static files
app.use(express.static(__dirname + '/public'));

// body parser, reading JSON data from body into req.body
app.use(express.json({ limit: '10kb' }));

// body parser, reading FORM data from body into req.body
app.use(express.urlencoded({extended: true}));

// data sanitaization against NoSql injection
app.use(mongoSanitize());

// data sanitaization against XSS
app.use(xss())

// prevent parameter pollution
// app.use(hpp({
//     whitelist: ['', '', '']
// }));

app.use('/api/v1/students', studentRouter);
app.use('/api/v1/admin-users', adminUserRouter);
app.use('/api/v1/rules-regulations', rulesRegulationsRouter);
app.use('/api/v1/gallery-images', imagesRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/queries', queryRouter);


// app.use('/api/v1/queries', userRouter);

// app.use('/api/v1/hostels', userRouter);


if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../hostel-client/build')));
    

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../hostel-client/build/index.html'))

    })
}
// catch all the other undefined routes
app.all('*', (req, res, next) => {
    next (new AppError(`cannot find ${req.originalUrl} on this server !`,404))
})


// global error middleware
app.use(globalErrorHandler);


module.exports=app;