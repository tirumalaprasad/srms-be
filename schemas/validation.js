import ajv from "ajv";
import addFormats from "ajv-formats";

import courseCreate from "./schema_courseCreate.json" assert { type: "json" };
import courseDelete from "./schema_courseDelete.json" assert { type: "json" };

import studentCreate from "./schema_studentCreate.json" assert { type: "json" };
import studentDelete from "./schema_studentDelete.json" assert { type: "json" };

import resultCreate from "./schema_result.json" assert { type: "json" };

const ajvObj = new ajv();
addFormats(ajvObj);

ajvObj.addSchema(courseCreate, "courseCreate");
ajvObj.addSchema(courseDelete, "courseDelete");

ajvObj.addSchema(studentCreate, "studentCreate");
ajvObj.addSchema(studentDelete, "studentDelete");

ajvObj.addSchema(resultCreate, "resultCreate");

export default ajvObj;
