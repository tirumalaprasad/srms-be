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
                where: { cou_name: course },
                defaults: { cou_name: course },
            });

            if (!created && courseObj.cou_isDeleted) {
                await courseObj.update({ cou_isDeleted: false });
                created = true;
            }

            return { courseName: courseObj.cou_name, created };
        } catch (error) {
            console.error("Error creating course: ", error);
            throw error;
        }
    };

    Course.findAllCourses = async () => {
        try {
            const courses = await Course.findAll({
                attributes: [["cou_id", "courseId"], ["cou_name", "courseName"]],
                where: { cou_isDeleted: false },
            });
            return courses;
        } catch (error) {
            console.error("Error fetching all courses: ", error);
            throw error;
        }
    };

    Course.softDeleteCourse = async (courseId) => {
        let transaction;
        try {
            transaction = await sequelize.transaction();
            const course = await Course.findByPk(courseId, { transaction });
            if (!course || course.cou_isDeleted) {
                console.error("Course not found");
                return { courseName: course.cou_name, deleted: false };
            }

            await course.update({ cou_isDeleted: true }, { transaction });

            await sequelize.models.Result.update(
                { res_isDeleted: true },
                {
                    where: { cou_id: courseId },
                    transaction,
                }
            );

            await transaction.commit();

            return { courseName: course.cou_name, deleted: true };
        } catch (error) {
            console.error("Error soft deleting course: ", error);
            if (transaction) await transaction.rollback();
            throw error;
        }
    };

    return Course;
};

export default getCourseModel;
