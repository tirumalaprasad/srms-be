import { logger } from "../log.js";
import { Router } from "express";
import models from "../models/index.js";
import ajvObj from "../schemas/validation.js";

const router = Router();

function validateRequest(schemaName) {
    return (req, res, next) => {
        const validate = ajvObj.getSchema(schemaName);
        if (!validate(req.body)) {
            logger.error(validate.errors);
            return res.status(400).send(validate.errors);
        }
        next();
    };
}

function errorHandler(err, req, res, next) {
    logger.error(err.message);
    return res.status(500).send({ message: err.message });
}

router.get("/", async (req, res) => {
    try {
        const resultObj = await models.Result.findAllResults();
        return res.status(200).send(resultObj);
    } catch (error) {
        console.error(error);
    }
});

router.get("/toeval", async (req, res) => {
    try {
        const p1 = models.Course.findAllCourses();
        const p2 = models.Student.findAllStudents();
        const [courseObj, studentObj] = await Promise.all([p1, p2]);
        let result = {
            courses: courseObj,
            students: studentObj,
        };
        return res.status(200).send(result);
    } catch (error) {
        console.error(error);
    }
});

router.post("/", validateRequest("resultCreate"), async (req, res, next) => {
    try {
        const resultObj = await models.Result.createResult(req.body);
        if (resultObj.created) {
            return res.status(200).send({
                message: "Result created",
                created: true,
            });
        } else {
            return res.status(200).send({
                message: "Result already exists or invalid input",
                created: false,
            });
        }
    } catch (error) {
        console.error(error);
    }
});

router.use(errorHandler);
export default router;
