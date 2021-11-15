const mongoose = require('mongoose');
const dotenv = require('dotenv');

//catch synchronous errors
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION ERROR 💥💥 \tShutting down .....');
    console.log(err);
    process.exit(1);
});

const app = require('./app');

// set the path to the config file
dotenv.config({ path: './config.env' });

console.log(`\n ============ Running Environment : ${process.env.NODE_ENV} ============\n`);

// DB connection string
const DB = process.env.DB_CONNECT.replace('<PASSWORD>', process.env.DB_PASSWORD);

// database connection
mongoose.connect(DB, {
    useNewUrlParser: true, useUnifiedTopology: true
}).then(() => {
    console.log("DB connection Success !");
});

// create web server and listen to the incoming requests
const server = app.listen(process.env.PORT, () => {
    console.log(`Server is listening in port ${process.env.port}`);
});

// catch asynchronous errors
process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION ERROR 💥💥 \tShutting down .....');
    console.log(err);
    server.close(() => {
        process.exit(1);
    });
});
