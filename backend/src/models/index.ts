import * as Sequelize from 'sequelize';
// import decamelize from 'decamelize';

import configs from '../config/config';
import initPublication from './publication';

const env = process.env.NODE_ENV || 'development';
const config = configs[env];

console.log('\nCurrent env:', env);

const sequelize = new Sequelize.Sequelize(config.database, config.username, config.password, config);

type ModelType = typeof Sequelize.Model;

interface Models {
    Publication: ModelType;
    sequelize: typeof sequelize;
    Sequelize: typeof Sequelize;
    op: typeof Sequelize.Op;
}

// const defineModel = init => init(sequelize, Sequelize.DataTypes);
const models: Models = {
    Publication: initPublication(sequelize, Sequelize.DataTypes),
    sequelize,
    Sequelize,
    op: Sequelize.Op,
};

Object.keys(models).forEach((modelName: string) => {
    const nowModel = models[modelName];
    if (nowModel.associate) {
        nowModel.associate(models);
    }
});

export default models;
