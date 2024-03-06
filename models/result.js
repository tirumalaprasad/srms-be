import {logger} from '../log.js';
const getResultModel = (sequelize, { DataTypes }) => {
    const Result = sequelize.define(
        "Result",
        {
            res_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            res_score: {
                type: DataTypes.ENUM("A", "B", "C", "D", "E", "F"),
                allowNull: false,
                validate: {
                    isIn: [["A", "B", "C", "D", "E", "F"]],
                },
            },
            res_isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            modelName: "Result",
            tableName: "results",
            timestamps: false,
            indexes: [
                {
                    fields: ["cou_id"],
                },
                {
                    fields: ["stu_id"],
                },
            ],
        }
    );

    Result.belongsTo(sequelize.models.Course, { foreignKey: "cou_id" });
    Result.belongsTo(sequelize.models.Student, { foreignKey: "stu_id" });

    Result.createResult = async (resultObj) => {
        const { courseId, studentId } = resultObj;

        try {
            const [course, student] = await Promise.all([
                sequelize.models.Course.findByPk(courseId, {
                    attributes: ["cou_isDeleted"],
                }),
                sequelize.models.Student.findByPk(studentId, {
                    attributes: ["stu_isDeleted"],
                }),
            ]);

            if (
                !course ||
                !student ||
                course.cou_isDeleted ||
                student.stu_isDeleted
            ) {
                logger.info("Course or Student is invalid");
                return { ...resultObj, created: false };
            }

            let [result, created] = await Result.findOrCreate({
                where: { cou_id: courseId, stu_id: studentId },
                defaults: {
                    res_score: resultObj.score,
                },
            });

            if (!created && result.res_isDeleted) {
                await result.update({ res_isDeleted: false });
                created = true;
            }

            return { ...resultObj, created };
        } catch (error) {
            logger.error("Error creating result: ", error.message);
            throw error;
        }
    };

    Result.findAllResults = async () => {
        try {
            const results = await Result.findAll({
                attributes: [
                    ["res_id","resultId"],
                    [sequelize.col("Course.cou_id"), "courseId"],
                    [sequelize.col("Course.cou_name"), "courseName"],
                    [sequelize.col("Student.stu_id"), "studentId"],
                    [sequelize.col("Student.stu_full_name"), "studentFullName"],
                    ["res_score", "score"],
                ],
                include: [
                    {
                        model: sequelize.models.Course,
                        attributes: [],
                        where: { cou_isDeleted: false },
                    },
                    {
                        model: sequelize.models.Student,
                        attributes: [],
                        where: { stu_isDeleted: false },
                    },
                ],
                where: { res_isDeleted: false },
            });
            return results;
        } catch (error) {
            logger.error("Error fetching all results: ", error.message);
            throw error;
        }
    };

    return Result;
};

export default getResultModel;
