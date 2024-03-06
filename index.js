import "dotenv/config";
// import cors from "cors";
import compression from "compression";
import express from "express";
import helmet from "helmet";
import { expressWinston, logger } from "./log.js";
import routes from "./routes/index.js";
import models from "./models/index.js";
import authenticateToken from "./auth.js";

const app = express();

// Third-Party Middleware
app.use(compression());
// app.use(
//     cors({
//         origin: "https://vercel.com",
//         methods: ["GET", "POST", "PUT"],
//     })
// );
app.use(helmet());
app.use(authenticateToken);
const PORT = process.env.PORT || 3000;

// Built-In Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.disable("x-powered-by");

app.use(
    expressWinston.logger({
        winstonInstance: logger,
        responseWhitelist: ["body"],
        requestWhitelist: ["headers", "query", "body"],
    })
);
app.use(async (req, res, next) => {
    req.context = { models };
    next();
});

// * Routes * //
app.get("/health", (req, res) => {
    res.status(200).send(`Healthy 😎`);
});

app.use("/course", routes.course);
app.use("/result", routes.result);
app.use("/student", routes.student);

// custom error handler
app.use((req, res, next) => {
    res.status(404).send({
        message: "404 Not Found",
    });
});

app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).send({
        error: err.message,
    });
});

// * Start * //

app.listen(PORT, () => {
    logger.info(`Listening on ${PORT}`);
});
