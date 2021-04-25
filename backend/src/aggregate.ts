/* eslint-disable no-await-in-loop */

import axios from 'axios';

import { prisma } from './server';

// const resetDatabase = true;

const dblpUrl = 'https://dblp.org/search/publ/api';
const crossRefWorksUrl = 'https://api.crossref.org/works/';

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

// interface Record {
//     title: string
//     type: string
//     year: number
//     volume?: string
//     venue?: string
//     pdfUrl?: string
// }

const fetchDblp = async () => {
    let enabled = true;

    let startAt;
    // let startAt: any = [2011, 3560];

    // const dblpSize = 1000;
    const dblpSize = 20;
    // const dblpSize = 2;
    const minYear = 1936;
    const maxYear = new Date().getFullYear();
    // const dblpYear = new Array(maxYear - minYear + 1).fill(minYear).map((v, i) => v + i).join('|');
    const queryOptions = new Array(maxYear - minYear + 1).fill(minYear).map((v, i) => [v + i, -dblpSize]);
    // const queryOptions = new Array(maxYear - 1998 + 1).fill(1998).map((v, i) => [v + i, -dblpSize + 20]);
    let numOptions = queryOptions.length;
    let queryIndex = -1;
    let batchNum = 0;
    const defaultSleep = 1500;
    const shortSleep = 500;
    let nextSleep = defaultSleep;

    while (enabled) {
        const batchNumNow = ++batchNum;

        console.log('\nFetching...');

        queryIndex = (queryIndex + 1) % numOptions;
        const queryIndexNow = queryIndex;
        queryOptions[queryIndexNow][1] += dblpSize;
        const [dblpYear, dblpOffset] = queryOptions[queryIndexNow];
        console.log(queryIndexNow, dblpYear, dblpOffset);

        if (startAt) {
            if (dblpYear < startAt[0] || dblpOffset < startAt[1]) {
                continue;
            } else {
                startAt = null;
            }
        }

        await sleep(nextSleep);
        nextSleep = shortSleep;

        try {
            const dblpUrlNow = `${dblpUrl}?q=${dblpYear}&format=json&h=${dblpSize}&f=${dblpOffset}`;
            const { data, ...response } = await axios.get(dblpUrlNow);
            console.log('fetchDblp response', dblpSize, dblpOffset, 'status', response.status, 'statusText', response.statusText, `(${dblpUrlNow})`);

            let results = data.result.hits.hit;

            results = (results || [])
                .filter(({ info: sourceResult }: any) => sourceResult.doi != undefined)
                .map(({ info: sourceResult }: any) => {
                    sourceResult.doi = sourceResult.doi.toLowerCase();
                    return sourceResult;
                });

            if (results.length === 0) {
                console.log('No results for query!');
                queryOptions.splice(queryIndex, 1);
                numOptions--;
                queryIndex--;
                continue;
            }

            const firstResultInDb = await prisma.publication.findFirst({
                where: {
                    doi: results[0].doi,
                },
            });

            if (firstResultInDb != null) {
                console.log('Data already exists, skipping...');
                continue;
            }

            // eslint-disable-next-line @typescript-eslint/no-loop-func
            const crDataAll: any = (await Promise.all(results.map(async (sourceResult: any) => {
                // console.log('fetching', `${crossRefWorksUrl}${sourceResult.doi}`);

                let crData: any;

                try {
                    const { data: crResult }: any = await axios.get(`${crossRefWorksUrl}${sourceResult.doi}`);
                    crData = crResult.message;
                } catch (err) {
                    if (err.response && err.response.status === 404) {
                        console.log(`----------- ${err.response.status} CrossRef failed (suppressed):`, err);
                        return undefined;
                    }
                    // throw err;
                    console.log(`>>>>>>>>>>> ${err.response.status} CrossRef failed:`, err);
                    nextSleep = 1000 * 60;
                    return undefined;
                }
                // console.log(crData);

                return crData;
            }))).filter((crData: any) => crData != undefined);

            const resultQueries = crDataAll.map((crData: any) => {
                // if (enabled === false) return undefined;

                let venueType = 'Unknown';
                if (crData.type.startsWith('journal')) {
                    venueType = 'Journal';
                } else if (crData.type.startsWith('proceedings')) {
                    venueType = 'Conference';
                }

                const publTitle = crData.title[0];
                const publDoi = crData.DOI.toLowerCase();
                const publType = crData.type;
                const publYear = crData.created['date-parts'][0][0];
                const publStampCreated = new Date(crData.created.timestamp);
                const publVolume = crData.volume;
                const publPdfUrl = crData.link?.[0]?.URL;
                const publPageUrl = crData.URL;
                let authorList = (crData.author || []);
                const venueList = crData['container-title'];
                const venueTitle = venueList?.[0];
                const venueIssn = crData.ISSN?.[0];

                authorList = authorList
                    .filter((author: any) => author.given != undefined && author.family != undefined)
                    .map((author: any) => {
                        author.given = author.given.replace(/[^a-z\- .,']+/ig, '');
                        author.family = author.family.replace(/[^a-z\- .,']+/ig, '');
                        return author;
                    });

                if (!publTitle || !publDoi || !authorList.length) {
                    let missing = '';
                    if (!publTitle) {
                        missing = 'title';
                    } else if (!publDoi) {
                        missing = 'doi';
                    } else if (!authorList.length) {
                        missing = 'author';
                    }
                    console.log(`Missing ${missing} (CrossRef), skipping...`);
                    return undefined;
                }

                const authorConnects = authorList
                    .map((author: any) => (
                        {
                            create: { firstName: author.given, lastName: author.family, fullName: `${author.given} ${author.family}`, orcid: author.ORCID },
                            where: { fullName: `${author.given} ${author.family}` },
                        }
                    ));

                const venueConnects = venueTitle !== undefined ? {
                    connectOrCreate: {
                        create: { title: venueTitle, type: venueType, issn: venueIssn },
                        where: { title: venueTitle },
                    },
                } : undefined;

                console.log(new Date(), '|', batchNumNow, '|', publDoi, '|', publTitle);
                // console.dir(crData, { depth: 1 });

                // console.dir({
                //     nowStamp: new Date(),
                //     batch: batchNumNow,
                //     idx,
                //     doi: publDoi,
                //     publicationTitle: crData.title.length > 1 ? crData.title : publTitle,
                //     connectOrCreateAuthor: authorConnects,
                //     connectOrCreateVenue: venueConnects,
                // }, { depth: Infinity });

                return prisma.publication.upsert({
                    where: { title: publTitle },
                    update: {},
                    create: {
                        title: publTitle,
                        doi: publDoi,
                        type: publType,
                        year: publYear,
                        stampCreated: publStampCreated,
                        volume: publVolume,
                        pdfUrl: publPdfUrl,
                        pageUrl: publPageUrl,
                        // authors: {
                        //     connectOrCreate: crData.author.map((author: any) => (
                        //         {
                        //             create: { firstName: author.given, lastName: author.family, orcid: author.ORCID },
                        //             where: { lastName: author.family },
                        //         }
                        //     )),
                        // },
                        authors: {
                            connectOrCreate: authorConnects,
                        },
                        // authors: {
                        //     create: crData.author.map((author: any) => (
                        //         { firstName: author.given, lastName: author.family, orcid: author.ORCID }
                        //     )),
                        // },
                        venue: venueConnects,
                    },
                });
            }).filter((query: any) => query != undefined);

            // console.log(resultQueries);

            await prisma.$transaction(resultQueries);

            // const output = await prisma.publication.createMany({ data: newRecords, skipDuplicates: true });
            // console.log('>> create output:');
            // console.dir(output, { depth: null });

            console.log(`Done, ran ${resultQueries.length} queries`);
        } catch (err) {
            enabled = false;
            console.log('[Aggregation failed]:');
            console.error(err);
            break;
        }

        if (nextSleep === shortSleep) nextSleep = defaultSleep;

        // return;
    }

    console.log('Finished fetching!');

    return () => {
        enabled = false;
    };
};

fetchDblp();
