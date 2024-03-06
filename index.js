import 'dotenv/config';
import cors from 'cors';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import expressWinston from 'express-winston';
import winston from 'winston';
import routes from './routes/index.js';
import models from './models/index.js';

const app = express();

// Third-Party Middleware
app.use(compression());
app.use(cors({
    origin: 'https://vercel.com',
    methods: ['GET', 'POST', 'PUT'],
}));
app.use(helmet());
const PORT = process.env.PORT || 3000;

// Built-In Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable('x-powered-by');

// Custom Middleware
const logger = winston.createLogger({
    level: 'info', // Set your desired log level
    format: winston.format.json(), // Use JSON format for logs
    transports: [
        new winston.transports.Console() // Add desired transports (e.g., console)
    ]
});
// Use the express-winston middleware
app.use(expressWinston.logger({
    winstonInstance: logger,
    // Other configuration options
}));

app.use(async (req, res, next) => {
    req.context = { models };
    next();
});

// * Routes * //
app.get('/health', (req, res) => {
    res.status(200).send(`Healthy 😎`);
});

app.use('/course', routes.course);
app.use('/result', routes.result);
app.use('/student', routes.student);

// custom error handler
app.use((req, res, next) => {
    res.status(404).send({
        message: '404 Not Found'
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({
        error: err.message
    });
});

// * Start * //

app.listen(PORT, () => {
    console.log(`Listening on ${PORT}`);
});