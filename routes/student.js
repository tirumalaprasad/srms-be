import { Router } from "express";
import models from "../models/index.js";
import ajvObj from "../schemas/validation.js";
import { AgeFromDateString } from "age-calculator";

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

function calculateAge(dob) {
    const studentAge = new AgeFromDateString(dob).age;
    console.log("-----------studentAge:", studentAge);
    if (studentAge < 10) {
        throw new Error("Student is under 10");
    }
}

// Student get all
router.get("/", async (req, res) => {
    try {
        const studentRes = await models.Student.findAllStudents();
        return res.send(studentRes);
    } catch (error) {
        next(error);
    }
});

// Student create
router.post("/", validateRequest("studentCreate"), async (req, res, next) => {
    try {
        calculateAge(req.body.dob);
        const studentRes = await models.Student.findOrCreateStudent(req.body);
        return res.status(200).send(studentRes);
    } catch (error) {
        next(error);
    }
});

// Student delete
router.put("/", validateRequest("studentDelete"), async (req, res, next) => {
    try {
        const studentRes = await models.Student.softDeleteStudent(req.body);
        return res.status(200).send(studentRes);
    } catch (error) {
        next(error);
    }
});

router.use(errorHandler);
export default router;
