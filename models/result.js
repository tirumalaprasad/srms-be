const getResultModel = (sequelize, { DataTypes }) => {
    const Result = sequelize.define(
        "Result",
        {
            res_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            res_score: {
                type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E', 'F'),
                allowNull: false,
                validate: {
                    isIn: [['A', 'B', 'C', 'D', 'E', 'F']]
                }
            },
            res_isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            },
        },
        {
            modelName: "Result",
            tableName: "results",
            timestamps: false,
            indexes: [
                {
                    fields: ['cou_id']
                },
                {
                    fields: ['stu_id']
                }
            ]
        }
    );

    Result.belongsTo(sequelize.models.Course, { foreignKey: 'cou_id' });
    Result.belongsTo(sequelize.models.Student, { foreignKey: 'stu_id' });


    Result.createResult = async (resultData) => {
        const { cou_id, stu_id } = resultData;

        try {
            const [course, student] = await Promise.all([
                sequelize.models.Course.findByPk(cou_id),
                sequelize.models.Student.findByPk(stu_id)
            ]);

            if (!course || !student || course.cou_isDeleted || student.stu_isDeleted) {
                throw new Error('Course/Student is soft deleted');
            }

            let [result, created] = await Result.findOrCreate({
                where: { cou_id, stu_id },
                defaults: {
                    res_score: resultData.score
                }
            });

            if (!created && result.res_isDeleted) {
                await result.update({ res_isDeleted: false });
            }

            return { result, created };
        } catch (error) {
            console.error("Error creating result: ", error);
            throw error;
        }
    };

    Result.findAllResults = async () => {
        try {
            const results = await Result.findAll({ where: { res_isDeleted: false } });
            return results;
        } catch (error) {
            console.error("Error fetching all results: ", error);
            throw error;
        }
    };

    return Result;
};

export default getResultModel;
