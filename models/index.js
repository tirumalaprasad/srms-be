import logger from '../index.js';
import Sequelize from "sequelize";
import getStudentModel from "./student.js";
import getCourseModel from "./course.js";
import getResultModel from "./result.js";

const sequelize = new Sequelize(process.env.DB_URL, {
    logging: console.log,
    dialectOptions: {
        ssl: {
            require: false,
            rejectUnauthorized: false
        }
    },
});

try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully');
} catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
}

const models = {
    Student: getStudentModel(sequelize, Sequelize),
    Course: getCourseModel(sequelize, Sequelize),
    Result: getResultModel(sequelize, Sequelize),
};

if (process.env.NODE_ENV === "test") {
    sequelize.sync({ force: true });
    logger.info("All models were synchronized successfully.");
}
export { sequelize };

export default models;
