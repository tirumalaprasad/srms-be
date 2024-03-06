import logger from '../index.js';
const getStudentModel = (sequelize, { DataTypes }) => {
    const Student = sequelize.define(
        "Student",
        {
            stu_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            stu_first_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            stu_family_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            stu_full_name: {
                type: DataTypes.STRING,
                // get() {
                //     return `${this.stu_first_name} ${this.stu_family_name}`;
                // }
            },
            stu_date_of_birth: {
                type: DataTypes.DATEONLY,
                allowNull: false,
            },
            stu_email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: true,
                },
            },
            stu_isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            modelName: "Student",
            tableName: "students",
            timestamps: false,
            indexes: [
                {
                    unique: true,
                    fields: ["stu_email"],
                },
            ],
            hooks: {
                beforeSave: (student) => {
                    student.stu_full_name = `${student.stu_first_name} ${student.stu_family_name}`;
                },
            },
        }
    );

    // Define class methods
    Student.findOrCreateStudent = async (student) => {
        try {
            let [studentObj, created] = await Student.findOrCreate({
                where: { stu_email: student.email },
                defaults: {
                    stu_first_name: student.firstName,
                    stu_family_name: student.familyName,
                    stu_date_of_birth: student.dob,
                    stu_email: student.email,
                },
            });

            if (!created && studentObj.stu_isDeleted) {
                await studentObj.update({ stu_isDeleted: false });
                created = true;
            }

            return { ...student, created };
        } catch (error) {
            logger.error("Error creating student: ", error.message);
            throw error;
        }
    };

    Student.findAllStudents = async () => {
        try {
            const students = await Student.findAll({
                attributes: [
                    ["stu_id", "studentId"],
                    ["stu_full_name", "studentFullName"],
                    ["stu_date_of_birth", "studentDoB"],
                    ["stu_email", "studentEmail"],
                ],
                where: { stu_isDeleted: false },
            });
            return students;
        } catch (error) {
            logger.error("Error fetching all students: ", error.message);
            throw error;
        }
    };

    Student.softDeleteStudent = async (student) => {
        let transaction;
        try {
            transaction = await sequelize.transaction();

            let studentObj = await Student.findByPk(student.studentId, {
                transaction,
            });
            if (!studentObj || studentObj.stu_isDeleted) {
                return { ...student, deleted: false };
            }

            await studentObj.update({ stu_isDeleted: true }, { transaction });

            await sequelize.models.Result.update(
                { res_isDeleted: true },
                {
                    where: { stu_id: student.studentId },
                    transaction,
                }
            );

            await transaction.commit();
            return { studentName: studentObj.stu_full_name, deleted: true };
        } catch (error) {
            logger.error("Error soft deleting student: ", error.message);
            if (transaction) await transaction.rollback();
            throw error;
        }
    };

    return Student;
};

export default getStudentModel;
