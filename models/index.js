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

const models = {
    Student: getStudentModel(sequelize, Sequelize),
    Course: getCourseModel(sequelize, Sequelize),
    Result: getResultModel(sequelize, Sequelize),
};

if (process.env.NODE_ENV === "test") {
    sequelize.sync({ force: true });
    console.log("All models were synchronized successfully.");
}
export { sequelize };

export default models;
