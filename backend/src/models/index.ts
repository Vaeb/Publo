import * as Sequelize from 'sequelize';
// import decamelize from 'decamelize';

import configs from '../config/config';
import initPublication from './publication';

const env = process.env.NODE_ENV || 'development';
const config = configs[env];

console.log('\nCurrent env:', env);

const sequelize = new Sequelize.Sequelize(config.database, config.username, config.password, config);

type ModelType = typeof Sequelize.Model & { associate?: (models: Models) => void };

export interface Models {
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

function keys<T>(obj: T): (keyof T)[] {
    return Object.keys(obj) as any;
}

keys<Models>(models).forEach((modelName) => {
    const nowModel = models[modelName];
    if ('associate' in nowModel && nowModel.associate) {
        nowModel.associate(models);
    }
});

export default models;
