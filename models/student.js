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
                type: DataTypes.VIRTUAL,
                get() {
                    return `${this.stu_first_name} ${this.stu_family_name}`;
                }
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
    Student.findOrCreateStudent = async (studentData) => {
        try {
            const [studentObj, created] = await Student.findOrCreate({
                where: { stu_email: studentData.stu_email },
                defaults: {
                    stu_first_name: studentData.first_name,
                    stu_family_name: studentData.family_name,
                    stu_date_of_birth: studentData.date_of_birth,
                    stu_email: studentData.email
                },
            });

            if (!created && studentObj.stu_isDeleted) {
                await studentObj.update({ stu_isDeleted: false });
            }

            return { studentObj, created };
        } catch (error) {
            console.error("Error creating student: ", error);
            throw error;
        }
    };


    Student.findAllStudents = async () => {
        try {
            const students = await Student.findAll({
                attributes: [
                    "stu_id",
                    "stu_full_name",
                    "stu_date_of_birth",
                    "stu_email",
                ],
                where: { stu_isDeleted: false },
            });
            return students;
        } catch (error) {
            console.error("Error fetching all students: ", error);
            throw error;
        }
    };

    Student.softDeleteStudent = async (studentId) => {
        let transaction;
        try {
            transaction = await sequelize.transaction();

            const student = await Student.findByPk(studentId, { transaction });
            if (!student) {
                throw new Error("Student not found");
            }

            await student.update({ stu_isDeleted: true }, { transaction });

            await sequelize.models.Result.update(
                { res_isDeleted: true },
                {
                    where: { stu_id: studentId },
                    transaction,
                }
            );

            await transaction.commit();
            return student;
        } catch (error) {
            console.error("Error soft deleting student: ", error);
            if (transaction) await transaction.rollback();
            throw error;
        }
    };

    return Student;
};

export default getStudentModel;
