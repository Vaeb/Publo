import axios from 'axios';

import connect from './connect';

const resetDatabase = true;

const dblpUrl = 'https://dblp.org/search/publ/api';

/*
    dblp
    total: >5,400,000

    and:         3,653,860
    conf:        2,788,693
    conference:  2,771,551
    a:           2,648,355
    journal:     2,108,201
    of:          1,940,033
    the:         1,254,772
    on:            781,725
    0:             737,582
    with:          615,970
    2020:          361,483
    publication:   353,232
    from:          177,665
*/

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const fetchDblp = async (models) => {
    let enabled = true;

    // const dblpQuery = new Array(2021-1936+1).fill(1936).map((v, i) => v + i).join('|');
    const dblpQuery = 2020;
    const size = 1000;
    let first = 0;
    // let i = 2;

    let titles = {};

    while (enabled) {
        // if (!i--) break;

        console.log('\nFetching...');

        try {
            // eslint-disable-next-line no-await-in-loop
            const { data, ...response } = await axios.get(`${dblpUrl}?q=${dblpQuery}&format=json&h=${size}&f=${first}`);
            console.log('fetchDblp response', size, first, 'status', response.status, 'statusText', response.statusText);

            const results = data.result.hits.hit;

            // await models.Publication.bulkCreate(hits.map(hit => ({ title: hit.info.title, type: hit.info.type })), { validation: true, ignoreDuplicates: true });

            let numCopies = 0;
            // eslint-disable-next-line no-await-in-loop
            await Promise.all(
                // eslint-disable-next-line no-loop-func
                results.map(async ({ info: result }) => {
                    const existingPublication = await models.Publication.findOne({ where: { title: result.title }, raw: true });
                    if (existingPublication === null && !titles[result.title]) {
                        titles[result.title] = true;
                        return models.Publication.create({
                            title: result.title,
                            type: result.type,
                            volume: result.volume,
                            year: result.year,
                        });
                    }
                    numCopies++;
                    return undefined;
                })
            );

            console.log(`Done, ${numCopies} copies found`);
        } catch (err) {
            console.log('fetchDblp failed');
            console.error(err);
            break;
        }

        // eslint-disable-next-line no-await-in-loop
        await sleep(2000);

        first += size;
        titles = {};
    }

    console.log('Finished fetching!');

    return () => {
        enabled = false;
    };
};

connect(resetDatabase).then((models) => {
    console.log('');
    console.log('(aggregate.js) Sequelize synced');
    fetchDblp(models);
});