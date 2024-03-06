import { Router } from "express";
import models from "../models/index.js";
import ajvObj from "../schemas/validation.js";

const router = Router();

function validateRequest(schemaName) {
    return (req, res, next) => {
        const validate = ajvObj.getSchema(schemaName);
        if (!validate(req.body)) {
            console.error(validate.errors);
            return res.status(400).send(validate.errors);
        }
        next();
    };
}

function errorHandler(err, req, res, next) {
    console.error(err);
    return res.status(500).send({ message: err.message });
}

// Course get all
router.get("/", async (req, res) => {
    try {
        const courseRes = await models.Course.findAllCourses();
        return res.send(courseRes);
    } catch (error) {
        next(error);
    }
});

// Course create
router.post("/", validateRequest("courseCreate"), async (req, res, next) => {
    try {
        const courseRes = await models.Course.findOrCreateCourse(req.body);
        return res.status(200).send(courseRes);
    } catch (error) {
        next(error);
    }
});

// Course delete
router.put("/", validateRequest("courseDelete"), async (req, res, next) => {
    try {
        const courseRes = await models.Course.softDeleteCourse(req.body);
        return res.status(200).send(courseRes);
    } catch (error) {
        next(error);
    }
});

router.use(errorHandler);
export default router;
