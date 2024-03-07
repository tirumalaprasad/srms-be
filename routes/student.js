import { logger } from "../log.js";
import { Router } from "express";
import models from "../models/index.js";
import ajvObj from "../schemas/validation.js";
import { AgeFromDateString } from "age-calculator";

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

function isValidAge(dob) {
    const studentAge = new AgeFromDateString(dob).age;
    return studentAge > 10;
}

// Student get all
router.get("/", async (req, res) => {
    try {
        const studentRes = await models.Student.findAllStudents();
        return res.send(studentRes);
    } catch (error) {
       console.error(error);
    }
});

// Student create
router.post("/", validateRequest("studentCreate"), async (req, res, next) => {
    try {
        if (!isValidAge(req.body.dob)) {
            logger.error("Student is under 10");
            return res
                .status(200)
                .send({
                    message: "Student is under 10 years of age",
                    created: true,
                });
        }
        const studentRes = await models.Student.findOrCreateStudent(req.body);
        if (studentRes.created) {
            return res.status(200).send({
                message: `Student ${studentRes.firstName} ${studentRes.familyName} created`,
                created: true,
            });
        } else {
            return res
                .status(200)
                .send({
                    message: "Student already exists or invalid input",
                    created: false,
                });
        }
    } catch (error) {
       console.error(error);
    }
});

// Student delete
router.put("/", validateRequest("studentDelete"), async (req, res, next) => {
    try {
        const studentRes = await models.Student.softDeleteStudent(req.body);
        if (studentRes.deleted) {
            return res
                .status(200)
                .send({ message: "Student deleted", deleted: true });
        } else {
            return res
                .status(200)
                .send({
                    message: "Student already deleted or invalid input",
                    deleted: false,
                });
        }
    } catch (error) {
       console.error(error);
    }
});

router.use(errorHandler);
export default router;
