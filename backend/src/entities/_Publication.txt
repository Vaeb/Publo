import * as Sequelize from 'sequelize';

export default (sequelize: Sequelize.Sequelize, DataTypes: typeof Sequelize.DataTypes): typeof Sequelize.Model => {
    const Publication = sequelize.define(
        'publication',
        {
            title: {
                allowNull: false,
                type: DataTypes.STRING(1023),
                unique: true,
            },
            type: {
                type: DataTypes.STRING,
            },
            volume: {
                type: DataTypes.STRING,
            },
            year: {
                type: DataTypes.INTEGER,
            },
        }
    );

    return Publication;
};
