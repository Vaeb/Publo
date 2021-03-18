import OrmSetup from './server';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default (resetDatabase: boolean): any => new Promise(async (resolve, reject) => {
    let reconnectsLeft = 20;
    let connected = false;

    while (!connected && reconnectsLeft) {
        try {
            // eslint-disable-next-line no-await-in-loop
            await models.sequelize.authenticate();
            connected = true;
        } catch (err) {
            console.log('reconnecting in 5 seconds');
            // eslint-disable-next-line no-await-in-loop
            await sleep(5000);
            reconnectsLeft -= 1;
        }
    }

    if (!connected) {
        return reject(new Error("Couldn't connect to sequelize"));
    }

    console.log('Connected to sequelize');

    models.sequelize.sync({ force: resetDatabase }).then(() => {
        resolve(models);
    });

    return true;
});
