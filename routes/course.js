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

// Course get all
router.get("/", async (req, res) => {
    try {
        const courseRes = await models.Course.findAllCourses();
        return res.send(courseRes);
    } catch (error) {
       console.error(error);
    }
});

// Course create
router.post("/", validateRequest("courseCreate"), async (req, res, next) => {
    try {
        const courseRes = await models.Course.findOrCreateCourse(req.body);
        if (courseRes.created) {
            return res
                .status(200)
                .send({
                    message: `Course ${courseRes.courseName} created`,
                    created: true,
                });
        } else {
            return res
                .status(200)
                .send({
                    message: `Course ${courseRes.courseName} already exists or invalid input`,
                    created: false,
                });
        }
    } catch (error) {
       console.error(error);
    }
});

// Course delete
router.put("/", validateRequest("courseDelete"), async (req, res, next) => {
    try {
        const courseRes = await models.Course.softDeleteCourse(req.body);
        if (courseRes.deleted) {
            return res.status(200).send({
                message: `Course deleted`,
                deleted: true,
            });
        } else {
            return res
                .status(200)
                .send({
                    message: `Course already deleted or invalid input`,
                    deleted: false,
                });
        }
    } catch (error) {
       console.error(error);
    }
});

router.use(errorHandler);
export default router;
