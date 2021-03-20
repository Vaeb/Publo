/* eslint-disable no-await-in-loop */

import axios from 'axios';

import { prisma } from './server';

// const resetDatabase = true;

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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

console.log('Aggregating publications...');

const fetchDblp = async () => {
    let enabled = true;

    const minYear = 1936;
    const maxYear = new Date().getFullYear();
    // const query = new Array(maxYear - minYear + 1).fill(minYear).map((v, i) => v + i).join('|');
    const queryOptions = new Array(maxYear - minYear + 1).fill(minYear).map((v, i) => [v + i, 0]);
    let numOptions = queryOptions.length;
    let queryIndex = -1;

    const size = 1000;
    // const size = 2;

    while (enabled) {
        console.log('\nFetching...');

        queryIndex = (queryIndex + 1) % numOptions;
        const queryIndexNow = queryIndex;
        const [query, first] = queryOptions[queryIndexNow];
        console.log(queryIndexNow, query, first);

        try {
            const { data, ...response } = await axios.get(`${dblpUrl}?q=${query}&format=json&h=${size}&f=${first}`);
            console.log('fetchDblp response', size, first, 'status', response.status, 'statusText', response.statusText);

            const results = data.result.hits.hit;

            if (results === undefined) {
                console.log('No results for query!');
                queryOptions.splice(queryIndex, 1);
                numOptions--;
                queryIndex--;
                continue;
            }

            const newRecords: any = results.map(({ info: result }: any) => (
                { title: result.title, type: result.type, year: Number(result.year), volume: result.volume }
            ));

            const output = await prisma.publication.createMany({ data: newRecords, skipDuplicates: true });
            console.log('>> create output:');
            console.dir(output, { depth: null });

            console.log(`Done, ${newRecords.length} copies found (${output.count} new)`);
        } catch (err) {
            console.log('fetchDblp failed');
            console.error(err);
            break;
        }

        queryOptions[queryIndexNow][1] += size;

        // return;
        await sleep(1500);
    }

    console.log('Finished fetching!');

    return () => {
        enabled = false;
    };
};

fetchDblp();
