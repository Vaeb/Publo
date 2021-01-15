export default (sequelize, DataTypes) => {
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
