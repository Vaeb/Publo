import Sequelize from 'sequelize';
// import decamelize from 'decamelize';

import configs from '../config/config';
import initPublication from './publication';

const env = process.env.NODE_ENV || 'development';
const config = configs[env];

console.log('\nCurrent env:', env);

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const defineModel = init => init(sequelize, Sequelize.DataTypes);
const models = {
    Publication: defineModel(initPublication),
};

Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;
models.op = Sequelize.Op;

export default models;
