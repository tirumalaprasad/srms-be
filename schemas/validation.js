import ajv from 'ajv';
import courseCreate from './schema_courseCreate.json' assert { type: "json" };
import courseDelete from './schema_courseDelete.json' assert { type: "json" };

import schema_result from './schema_result.json' assert { type: "json" };
import schema_student from './schema_student.json' assert { type: "json" };

const ajvObj = new ajv();

ajvObj.addSchema(courseCreate, "courseCreate");
ajvObj.addSchema(courseDelete, "courseDelete");


ajvObj.addSchema(schema_result, "result");
ajvObj.addSchema(schema_student, "student");

export default ajvObj;
