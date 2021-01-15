import connect from './connect';

const resetDatabase = false;

connect(resetDatabase).then((models) => {
    console.log('(index.js) Sequelize synced');
});
