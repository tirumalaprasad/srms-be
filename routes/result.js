import { Router } from "express";
import models from "../models/index.js";
import ajvObj from "../schemas/validation.js";

const router = Router();

router.get("/", async (req, res) => {
    try {
        const courseRes = await models.Course.findAllCourses();
        return res.send(courseRes);
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Error",
        });
    }
});

router.post("/", async (req, res) => {
    const validate = ajvObj.getSchema("course");
    if (!validate(req.body)) {
        console.error(validate.errors);
        return res.status(400).send(validate.errors);
    }

    try {
        const courseRes = await models.Course.findOrCreateCourse(
            req.body.courseName
        );
        return res.status(200).send(courseRes);
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Error",
        });
    }
});

router.put("/", async (req, res) => {
    const validate = ajvObj.getSchema("course");
    if (!validate(req.body)) {
        console.error(validate.errors);
        return res.status(400).send(validate.errors);
    }

    try {
        const courseRes = await models.Course.softDeleteCourse(
            req.body.courseId
        );
        return res.status(200).send(courseRes);
    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: "Error",
        });
    }
});

export default router;
