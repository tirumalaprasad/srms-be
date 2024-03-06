import logger from '../index.js';
const getCourseModel = (sequelize, { DataTypes }) => {
    const Course = sequelize.define(
        "Course",
        {
            cou_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            cou_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            cou_isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            modelName: "Course",
            tableName: "courses",
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ["cou_name"],
                },
            ],
        }
    );

    // Define class methods
    Course.findOrCreateCourse = async (course) => {
        try {
            let [courseObj, created] = await Course.findOrCreate({
                where: { cou_name: course.courseName },
                defaults: { cou_name: course.courseName },
            });

            if (!created && courseObj.cou_isDeleted) {
                await courseObj.update({ cou_isDeleted: false });
                created = true;
            }

            return { ...course, created };
        } catch (error) {
            logger.error("Error creating course: ", error.message);
            throw error;
        }
    };

    Course.findAllCourses = async () => {
        try {
            const courses = await Course.findAll({
                attributes: [
                    ["cou_id", "courseId"],
                    ["cou_name", "courseName"],
                ],
                where: { cou_isDeleted: false },
            });
            return courses;
        } catch (error) {
            logger.error("Error fetching all courses: ", error.message);
            throw error;
        }
    };

    Course.softDeleteCourse = async (course) => {
        let transaction;
        try {
            transaction = await sequelize.transaction();
            const courseObj = await Course.findByPk(course.courseId, {
                transaction,
            });
            if (!courseObj || courseObj.cou_isDeleted) {
                logger.info("Course not found");
                return { ...course, deleted: false };
            }

            await courseObj.update({ cou_isDeleted: true }, { transaction });

            await sequelize.models.Result.update(
                { res_isDeleted: true },
                {
                    where: { cou_id: course.courseId },
                    transaction,
                }
            );

            await transaction.commit();

            return { courseName: courseObj.cou_name, deleted: true };
        } catch (error) {
            logger.error("Error soft deleting course: ", error.message);
            if (transaction) await transaction.rollback();
            throw error;
        }
    };

    return Course;
};

export default getCourseModel;
