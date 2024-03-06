import expressWinston from "express-winston";
import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.align(),
        winston.format.timestamp({
            format: "YYYY-MM-DD hh:mm:ss.SSS A",
        }),
        winston.format.colorize({ all: true }),
        winston.format.simple(),
        winston.format.printf(
            (info) => `${info.timestamp} - ${info.level}: ${info.message}`
        )
    ),
    transports: [new winston.transports.Console()],
});
export { expressWinston, logger };
