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

const parseVenueTypeFromField = (fieldVal: string, source: string) => {
    let venueType = 'Unknown';
    fieldVal = fieldVal.toLowerCase();

    if (source === 'crossref') {
        if (fieldVal.startsWith('journal')) {
            venueType = 'Journal';
        } else if (fieldVal.startsWith('proceedings')) {
            venueType = 'Conference';
        }
    } else if (source === 'dblp') {
        if (fieldVal.startsWith('journal')) {
            venueType = 'Journal';
        } else if (fieldVal.startsWith('conf')) {
            venueType = 'Conference';
        }
    }

    return venueType;
};

const parsePublicationType = (value: string) => {
    let newValue = 'Unknown';
    value = value.toLowerCase();

    if (/journal\W*article/.test(value)) {
        newValue = 'Journal Article';
    } else if (/\b(?:proceedings|conference)\b/.test(value)) {
        newValue = 'Proceedings Article';
    }

    return newValue;
};

const parseAuthorName = (name?: string) => (name == null ? undefined : name.replace(/[^a-z\- .,']+/ig, ''));

const parseVenueName = (name?: string) => (name == null ? undefined : name.replace(/^\W+|\W+$/ig, ''));

const mergeAuthorData = (authors1: any, authors2: any) => {
    const authorKeys = [...new Set([...Object.keys(authors1[0] || []), ...Object.keys(authors2[0] || [])])];
    const authors2Obj = Object.assign({}, ...authors2.map((author2: any) => ({ [author2.fullName]: author2 })));

    for (const author1 of authors1) {
        const author2 = authors2Obj[author1.fullName];
        if (author2) {
            for (const key of authorKeys) {
                if (author1[key] === undefined) {
                    author1[key] = author2[key];
                } else if (author2[key] === undefined) {
                    author2[key] = author1[key];
                }
            }
        }
    }
};

const getMergedPublData = (publ1: any, publ2: any) => {
    const mergedData: any = {};
    const publKeys = [...new Set([...Object.keys(publ1), ...Object.keys(publ2)])];

    for (const key of publKeys) {
        if (publ1[key]) {
            mergedData[key] = publ1[key];
        } else if (publ2[key]) {
            mergedData[key] = publ2[key];
        }
    }

    mergedData.source = 'merged';

    return mergedData;
};

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

        queryIndex = (queryIndex + 1) % numOptions;
        const queryIndexNow = queryIndex;
        console.log(`\nFetching from subset ${queryIndexNow} of ${queryOptions.length}...`);
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
                .filter(({ info: dblpData }: any) => dblpData.doi != undefined)
                .map(({ info: dblpData }: any) => {
                    dblpData.doi = dblpData.doi.toUpperCase();
                    return dblpData;
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
                    source: 'crossref',
                },
            });

            if (firstResultInDb != null) {
                console.log('Data already exists, skipping...');
                continue;
            }

            // eslint-disable-next-line @typescript-eslint/no-loop-func
            const crDataAll: any = (await Promise.all(results.map(async (dblpData: any) => {
                // console.log('fetching', `${crossRefWorksUrl}${dblpData.doi}`);

                let crData: any;

                try {
                    const { data: crResult }: any = await axios.get(`${crossRefWorksUrl}${dblpData.doi}`);
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

                return [dblpData, crData];
            }))).filter((crData: any) => crData != undefined);

            let numCreated = 0;
            let numUpdated = 0;

            for (const [dblpData, crData] of crDataAll) {
                // if (enabled === false) return undefined;

                const crAuthorList = (crData.author || [])
                    .filter((author: any) => author.given != undefined && author.family != undefined)
                    .map((author: any) => {
                        const firstName = parseAuthorName(author.given);
                        const lastName = parseAuthorName(author.family);
                        return { firstName, lastName, fullName: `${firstName} ${lastName}`, orcid: author.ORCID };
                    });

                let dblpAuthorList = (dblpData.authors?.author || []);
                dblpAuthorList = (Array.isArray(dblpAuthorList) ? dblpAuthorList : [dblpAuthorList])
                    .map((author: any) => {
                        const fullName = parseAuthorName(author.text);
                        if (!fullName) return undefined;
                        const nameParts = fullName.split(' ');
                        return { firstName: nameParts[0], lastName: nameParts.slice(1).join(' '), fullName, sourceId: author['@pid'] };
                    })
                    .filter((author: any) => author.firstName && author.lastName && author.fullName);

                mergeAuthorData(crAuthorList, dblpAuthorList);

                const crVenueList = (crData['container-title'] || [])
                    .map((venue: string) => parseVenueName(venue));

                const dblpVenue = parseVenueName(dblpData.venue);

                const crDataUse: any = {
                    source: 'crossref',
                    title: crData.title[0],
                    doi: crData.DOI.toUpperCase(),
                    type: parsePublicationType(crData.type),
                    year: crData.created['date-parts'][0][0],
                    stampCreated: new Date(crData.created.timestamp),
                    volume: crData.volume,
                    pdfUrl: crData.link?.[0]?.URL,
                    pageUrl: crData.URL,
                    authors: {
                        connectOrCreate: crAuthorList
                            .map((author: any) => (
                                {
                                    create: author,
                                    where: { fullName: author.fullName },
                                }
                            )),
                    },
                    venue: crVenueList.length ? {
                        connectOrCreate: {
                            create: { title: crVenueList[0], type: parseVenueTypeFromField(crData.type, 'crossref'), issn: crData.ISSN?.[0] },
                            where: { title: crVenueList[0] },
                        },
                    } : undefined,
                };

                const dblpDataUse: any = {
                    source: 'dblp',
                    title: dblpData.title,
                    doi: dblpData.doi,
                    type: parsePublicationType(dblpData.type),
                    year: Number(dblpData.year),
                    volume: dblpData.volume,
                    number: dblpData.number,
                    pages: dblpData.pages,
                    pageUrl: dblpData.ee,
                    authors: {
                        connectOrCreate: dblpAuthorList
                            .map((author: any) => (
                                {
                                    create: author,
                                    where: { fullName: author.fullName },
                                }
                            )),
                    },
                    venue: dblpVenue ? {
                        connectOrCreate: {
                            create: { title: dblpVenue, type: parseVenueTypeFromField(dblpData.key, 'dblp') },
                            where: { title: dblpVenue },
                        },
                    } : undefined,
                };

                let meetsRequired = true;
                const requiredFields = ['title', 'doi', 'type', 'year'];

                for (const field of requiredFields) {
                    if (!crDataUse[field] || !dblpDataUse[field]) {
                        console.log(`Missing ${field} (${!crDataUse[field] ? 'CrossRef' : 'DBLP'}), skipping...`);
                        meetsRequired = false;
                        break;
                    }
                }

                if (!meetsRequired) continue;

                const mergedDataUse = getMergedPublData(dblpDataUse, crDataUse);

                // const publicationRootConnect = {
                //     connect: {
                //         id: publRootId,
                //     },
                // };

                console.log(new Date(), '|', batchNumNow, '|', crDataUse.doi, '|', crDataUse.title);
                // console.dir(crData, { depth: 1 });

                // console.dir({
                //     nowStamp: new Date(),
                //     batch: batchNumNow,
                //     idx,
                //     doi: publDoiCr,
                //     publicationTitle: crData.title.length > 1 ? crData.title : publTitleCr,
                //     connectOrCreateAuthor: authorConnectsCr,
                //     connectOrCreateVenue: venueConnectCr,
                // }, { depth: Infinity });

                // console.dir({
                //     data: crDataUse,
                // }, { depth: Infinity });

                // const crPubl = await prisma.publication.create({
                //     data: crDataUse,
                // });
                // console.log(crPubl);

                // const dblpPubl = await prisma.publication.create({
                //     data: dblpDataUse,
                // });
                // console.log(dblpPubl);

                // return;

                const createPublications = {
                    create: [
                        mergedDataUse,
                        crDataUse,
                        dblpDataUse,
                    ],
                };

                const { id: publRootId } = (await prisma.publicationRoot.findFirst({
                    where: {
                        OR: [
                            { doi: crDataUse.doi },
                            { title: dblpData.title },
                            { title: crDataUse.title },
                        ],
                    },
                }) || {});

                if (publRootId) {
                    console.log(`Updating publication_root ${publRootId} to include newly created publications`);
                    numUpdated++;
                    // await prisma.publicationRoot.update({
                    //     where: { id: publRootId },
                    //     data: {
                    //         publications: createPublications, // Make sure it isn't overriding the existing ones
                    //     },
                    // });
                } else {
                    console.log('Creating new publication_root and publications');
                    numCreated++;
                    await prisma.publicationRoot.create({
                        data: {
                            doi: crDataUse.doi,
                            title: crDataUse.title,
                            publications: createPublications,
                        },
                    });
                }

                // await prisma.publication.create({
                //     data: {
                //         publicationRoot: publicationRootConnect,
                //         source: 'crossref',
                //         title: publTitleCr,
                //         doi: publDoiCr,
                //         type: publTypeCr,
                //         year: publYearCr,
                //         stampCreated: publStampCreatedCr,
                //         volume: publVolumeCr,
                //         pdfUrl: publPdfUrlCr,
                //         pageUrl: publPageUrlCr,
                //         authors: {
                //             connectOrCreate: authorConnectsCr,
                //         },
                //         venue: venueConnectCr,
                //     },
                // });
                // await prisma.publication.create({
                //     data: {
                //         publicationRoot: publicationRootConnect,
                //         source: 'crossref',
                //         title: publTitleCr,
                //         doi: publDoiCr,
                //         type: publTypeCr,
                //         year: publYearCr,
                //         stampCreated: publStampCreatedCr,
                //         volume: publVolumeCr,
                //         pdfUrl: publPdfUrlCr,
                //         pageUrl: publPageUrlCr,
                //         authors: {
                //             connectOrCreate: authorConnectsCr,
                //         },
                //         venue: venueConnectCr,
                //     },
                // });
            }

            console.log(`Done, ran ${numCreated + numUpdated} queries (${numCreated} created; ${numUpdated} updated)`);
            // return;
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
